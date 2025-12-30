#!/usr/bin/env node

/**
 * R2 Storage Connection Test Script
 * Tests the connection to Cloudflare R2 and verifies credentials
 * 
 * Usage:
 *   node scripts/test-r2.js
 */

import { config } from 'dotenv';
import { S3Client, ListBucketsCommand, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Load environment variables
config();

const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2PublicUrl = process.env.R2_PUBLIC_URL;

async function testR2Connection() {
  console.log('🔄 Testing Cloudflare R2 connection...\n');

  // Check configuration
  console.log('1️⃣  Checking configuration...');
  if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey || !r2BucketName) {
    console.error('❌ Missing R2 configuration:');
    if (!r2AccountId) console.error('   - R2_ACCOUNT_ID is missing');
    if (!r2AccessKeyId) console.error('   - R2_ACCESS_KEY_ID is missing');
    if (!r2SecretAccessKey) console.error('   - R2_SECRET_ACCESS_KEY is missing');
    if (!r2BucketName) console.error('   - R2_BUCKET_NAME is missing');
    process.exit(1);
  }

  console.log('   ✅ All required environment variables present');
  console.log(`   📦 Account ID: ${r2AccountId.substring(0, 10)}...`);
  console.log(`   📦 Bucket: ${r2BucketName}`);
  if (r2PublicUrl) {
    console.log(`   🌐 Public URL: ${r2PublicUrl}`);
  } else {
    console.log('   ⚠️  R2_PUBLIC_URL not set (signed URLs will be used)');
  }
  console.log('');

  // Create S3 client
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
    },
  });

  try {
    // Test 1: List buckets (to verify credentials)
    console.log('2️⃣  Testing credentials and connection...');
    try {
      const bucketsCommand = new ListBucketsCommand({});
      const bucketsResponse = await s3Client.send(bucketsCommand);
      console.log('   ✅ Credentials are valid');
      console.log(`   📊 Found ${bucketsResponse.Buckets?.length || 0} bucket(s) in account\n`);
    } catch (error) {
      // Some R2 setups don't support ListBuckets, so we'll test with the bucket directly
      console.log('   ⚠️  ListBuckets not available (this is normal for R2), testing bucket access directly...\n');
    }

    // Test 2: List objects in bucket (to verify bucket access)
    console.log('3️⃣  Testing bucket access...');
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: r2BucketName,
        MaxKeys: 5,
      });
      const listResponse = await s3Client.send(listCommand);
      const fileCount = listResponse.KeyCount || 0;
      console.log(`   ✅ Bucket access successful`);
      console.log(`   📄 Found ${fileCount} file(s) in bucket`);
      if (listResponse.Contents && listResponse.Contents.length > 0) {
        console.log('   📋 Sample files:');
        listResponse.Contents.slice(0, 3).forEach(obj => {
          console.log(`      - ${obj.Key} (${(obj.Size || 0 / 1024).toFixed(2)} KB)`);
        });
      }
      console.log('');
    } catch (error) {
      if (error.name === 'NoSuchBucket') {
        console.error(`   ❌ Bucket "${r2BucketName}" does not exist`);
        console.error('   💡 Please check the bucket name in your .env file');
        process.exit(1);
      } else if (error.name === 'AccessDenied' || error.$metadata?.httpStatusCode === 403) {
        console.error('   ❌ Access denied to bucket');
        console.error('   💡 Please check your R2 API token has Read & Write permissions');
        process.exit(1);
      } else {
        throw error;
      }
    }

    // Test 3: Test upload (optional - creates and deletes a test file)
    console.log('4️⃣  Testing file upload (optional test file)...');
    const testKey = `test/${Date.now()}-r2-test.txt`;
    const testContent = Buffer.from('R2 connection test file - safe to delete');
    
    try {
      // Upload test file
      const putCommand = new PutObjectCommand({
        Bucket: r2BucketName,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain',
      });
      await s3Client.send(putCommand);
      console.log('   ✅ File upload successful');

      // Delete test file
      const deleteCommand = new DeleteObjectCommand({
        Bucket: r2BucketName,
        Key: testKey,
      });
      await s3Client.send(deleteCommand);
      console.log('   ✅ File deletion successful');
      console.log('   🧹 Test file cleaned up\n');
    } catch (error) {
      console.error('   ⚠️  Upload test failed:', error.message);
      console.log('   💡 This might be a permissions issue. Check your R2 API token permissions.\n');
    }

    // Summary
    console.log('✅ R2 storage connection test completed successfully!');
    console.log('\n📋 Configuration Summary:');
    console.log(`   Account ID: ${r2AccountId.substring(0, 10)}...`);
    console.log(`   Bucket: ${r2BucketName}`);
    if (r2PublicUrl) {
      console.log(`   Public URL: ${r2PublicUrl}`);
      console.log('\n💡 Note: If files are not publicly accessible, ensure:');
      console.log('   1. Bucket has public access enabled in Cloudflare dashboard');
      console.log('   2. R2_PUBLIC_URL points to correct public endpoint');
      console.log('   3. Or configure a custom domain for R2');
    } else {
      console.log('\n💡 Note: R2_PUBLIC_URL not set. Files will use signed URLs.');
      console.log('   For public access, set R2_PUBLIC_URL to your public endpoint or custom domain');
    }

  } catch (error) {
    console.error('\n❌ R2 connection test failed:', error.message || error);
    if (error.name === 'InvalidAccessKeyId') {
      console.error('\n💡 Error: Invalid Access Key ID');
      console.error('   Please check R2_ACCESS_KEY_ID in your .env file');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('\n💡 Error: Invalid Secret Access Key');
      console.error('   Please check R2_SECRET_ACCESS_KEY in your .env file');
    } else if (error.$metadata?.httpStatusCode === 403) {
      console.error('\n💡 Error: Access denied');
      console.error('   Please check your R2 API token permissions');
    } else {
      console.error('\n💡 Error details:', error);
    }
    process.exit(1);
  }
}

// Run the test
testR2Connection().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

