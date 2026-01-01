import { useContext, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageCollaborator, PageRole } from '@/types';
import { formatPageRole, getPageRoleBadgeColor, canChangePageRole, canRemovePageMember } from '@/utils/pagePermissions';
import { PageContext } from '@/contexts/PageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { MoreVertical, Shield, Edit, Eye, Trash2, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface CollaboratorCardProps {
  collaborator: PageCollaborator;
  pageId: string;
  currentUserRole: PageRole;
  onRoleChange?: (collaboratorId: string, newRole: PageRole) => void;
  onRemove?: (collaboratorId: string) => void;
}

export default function CollaboratorCard({
  collaborator,
  pageId,
  currentUserRole,
  onRoleChange,
  onRemove,
}: CollaboratorCardProps) {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentUser = user?.id === collaborator.userId;
  const canModify = !isCurrentUser && collaborator.role !== 'owner';

  const getRoleIcon = (role: PageRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'editor':
        return <Edit className="h-3 w-3" />;
      case 'viewer':
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRoleChange = async (newRole: PageRole) => {
    if (!canChangePageRole(collaborator.role, newRole, currentUserRole)) {
      toast.error('You do not have permission to change this role');
      return;
    }

    setIsLoading(true);
    try {
      if (onRoleChange) {
        await onRoleChange(collaborator.id, newRole);
      }
      toast.success(`Role updated to ${formatPageRole(newRole)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!canRemovePageMember(currentUserRole, collaborator.role)) {
      toast.error('You do not have permission to remove this member');
      return;
    }

    setIsLoading(true);
    try {
      if (onRemove) {
        await onRemove(collaborator.id);
      }
      toast.success('Team member removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Avatar and Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={collaborator.user?.avatar} alt={collaborator.user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(collaborator.user?.name || collaborator.user?.email || 'U')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">
                  {collaborator.user?.name || 'Unknown User'}
                  {isCurrentUser && (
                    <span className="text-xs text-muted-foreground ml-1">(You)</span>
                  )}
                </p>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {collaborator.user?.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Joined {new Date(collaborator.acceptedAt || collaborator.invitedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Role Badge and Actions */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-1 rounded-full border ${getPageRoleBadgeColor(collaborator.role)} flex items-center gap-1`}
            >
              {getRoleIcon(collaborator.role)}
              {formatPageRole(collaborator.role)}
            </Badge>

            {canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={isLoading}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* Role Change Options */}
                  {canChangePageRole(collaborator.role, 'admin', currentUserRole) && (
                    <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Change to Admin
                    </DropdownMenuItem>
                  )}
                  {canChangePageRole(collaborator.role, 'editor', currentUserRole) && (
                    <DropdownMenuItem onClick={() => handleRoleChange('editor')}>
                      <Edit className="h-4 w-4 mr-2" />
                      Change to Editor
                    </DropdownMenuItem>
                  )}
                  {canChangePageRole(collaborator.role, 'viewer', currentUserRole) && (
                    <DropdownMenuItem onClick={() => handleRoleChange('viewer')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Change to Viewer
                    </DropdownMenuItem>
                  )}

                  {/* Remove Option */}
                  {canRemovePageMember(currentUserRole, collaborator.role) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleRemove}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from team
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
