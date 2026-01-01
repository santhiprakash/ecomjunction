import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AuthContext } from '@/contexts/AuthContext';
import { PageContext } from '@/contexts/PageContext';
import { SubscriptionPlan } from '@/types';
import { getPlanLimits, getRemainingTeamSlots, getTeamFeatureMessage } from '@/utils/featureGating';
import { Users, AlertCircle, Crown, Zap, Info } from 'lucide-react';

interface TeamLimitBannerProps {
  pageId: string;
  compact?: boolean;
}

export default function TeamLimitBanner({ pageId, compact = false }: TeamLimitBannerProps) {
  const { user } = useContext(AuthContext);
  const { getCollaborators } = useContext(PageContext);

  if (!user) return null;

  const plan = user.plan as SubscriptionPlan;
  const limits = getPlanLimits(plan);
  const collaborators = getCollaborators(pageId);
  const currentCount = collaborators.length;
  const remainingSlots = getRemainingTeamSlots(plan, currentCount);
  const featureMessage = getTeamFeatureMessage(plan);

  // Don't show banner if unlimited
  if (limits.maxTeamMembersPerPage === Infinity) {
    return null;
  }

  // Calculate progress percentage
  const maxAllowed = limits.maxTeamMembersPerPage + 1; // +1 for owner
  const progressPercentage = (currentCount / maxAllowed) * 100;

  // Determine banner variant based on remaining slots
  const getBannerVariant = () => {
    if (remainingSlots === 0) return 'destructive';
    if (remainingSlots === 1) return 'warning';
    return 'default';
  };

  const variant = getBannerVariant();

  // Compact version for sidebars
  if (compact) {
    return (
      <div className="p-3 bg-muted rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Team Members</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {currentCount}/{maxAllowed}
          </Badge>
        </div>

        <Progress value={progressPercentage} className="h-1.5" />

        {remainingSlots === 0 && plan !== 'enterprise' && (
          <Button asChild size="sm" className="w-full" variant="default">
            <Link to="/pricing">
              <Crown className="h-3 w-3 mr-1" />
              Upgrade
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // Full version
  return (
    <Alert variant={variant === 'destructive' ? 'destructive' : 'default'} className="mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {variant === 'destructive' ? (
            <AlertCircle className="h-5 w-5" />
          ) : variant === 'warning' ? (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          ) : (
            <Info className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <AlertTitle className="mb-1">Team Capacity</AlertTitle>
            <AlertDescription>
              {plan === 'free' ? (
                <span>
                  Your Free plan does not support team members. Upgrade to Pro to collaborate with up
                  to 3 team members per page.
                </span>
              ) : remainingSlots === 0 ? (
                <span>
                  You've reached the maximum team size ({maxAllowed} members including owner) for your{' '}
                  {plan.charAt(0).toUpperCase() + plan.slice(1)} plan. Upgrade to add more members.
                </span>
              ) : (
                <span>
                  You have {remainingSlots} {remainingSlots === 1 ? 'slot' : 'slots'} remaining out of{' '}
                  {maxAllowed} total team members (including owner).
                </span>
              )}
            </AlertDescription>
          </div>

          {/* Progress Bar */}
          {limits.maxTeamMembersPerPage > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{currentCount} members</span>
                <span>{maxAllowed} max</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Upgrade CTA */}
          {plan !== 'enterprise' && (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant={variant === 'destructive' ? 'default' : 'outline'}>
                <Link to="/pricing">
                  {plan === 'free' ? (
                    <>
                      <Zap className="h-4 w-4 mr-1" />
                      Upgrade to Pro
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-1" />
                      Upgrade to Enterprise
                    </>
                  )}
                </Link>
              </Button>
              <span className="text-xs text-muted-foreground">
                {plan === 'free'
                  ? 'Get 3 team members per page'
                  : 'Get unlimited team members'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}
