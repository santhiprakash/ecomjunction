import { useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageContext } from '@/contexts/PageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { PageRole, InviteMemberFormData } from '@/types';
import { toast } from 'sonner';
import { Mail, Loader2, UserPlus } from 'lucide-react';
import RoleSelector from './RoleSelector';
import { getPageRoleDescription } from '@/utils/pagePermissions';

interface InviteMemberModalProps {
  pageId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function InviteMemberModal({
  pageId,
  open,
  onOpenChange,
  onSuccess,
}: InviteMemberModalProps) {
  const { user } = useContext(AuthContext);
  const { inviteMember, canInviteMembers, getRemainingTeamSlotsForPage } = useContext(PageContext);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<InviteMemberFormData>({
    email: '',
    role: 'editor',
    message: '',
  });

  const remainingSlots = getRemainingTeamSlotsForPage(pageId);
  const canInvite = canInviteMembers(pageId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canInvite) {
      toast.error('You do not have permission to invite members');
      return;
    }

    if (remainingSlots === 0) {
      toast.error('Team is at capacity. Upgrade your plan to add more members.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await inviteMember(pageId, formData);
      toast.success(`Invitation sent to ${formData.email}`);

      // Reset form
      setFormData({
        email: '',
        role: 'editor',
        message: '',
      });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: PageRole) => {
    setFormData(prev => ({ ...prev, role }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to collaborate on this page. They'll receive an email with
            instructions to join your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-9"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Role Selector */}
            <RoleSelector
              value={formData.role}
              onChange={handleRoleChange}
              label={
                <>
                  Role <span className="text-destructive">*</span>
                </>
              }
              disabled={isLoading}
              showDescription={true}
            />

            {/* Optional Message */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Personal Message <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to the invitation..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                disabled={isLoading}
                className="resize-none"
              />
            </div>

            {/* Team Capacity Info */}
            {remainingSlots !== Infinity && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  {remainingSlots === 0 ? (
                    <span className="text-destructive font-medium">
                      Team is at capacity. Upgrade to add more members.
                    </span>
                  ) : (
                    <span>
                      {remainingSlots} {remainingSlots === 1 ? 'slot' : 'slots'} remaining on your
                      current plan.
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || remainingSlots === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
