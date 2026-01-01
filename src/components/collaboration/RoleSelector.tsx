import { PageRole } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  getInvitableRoles,
  formatPageRole,
  getPageRoleDescription,
} from '@/utils/pagePermissions';
import { Shield, Edit, Eye, Crown } from 'lucide-react';

interface RoleSelectorProps {
  value: PageRole;
  onChange: (role: PageRole) => void;
  label?: string;
  disabled?: boolean;
  showDescription?: boolean;
  includeOwner?: boolean;
}

export default function RoleSelector({
  value,
  onChange,
  label = 'Role',
  disabled = false,
  showDescription = true,
  includeOwner = false,
}: RoleSelectorProps) {
  const availableRoles = includeOwner
    ? (['owner', 'admin', 'editor', 'viewer'] as PageRole[])
    : getInvitableRoles();

  const getRoleIcon = (role: PageRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'editor':
        return <Edit className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="role-selector">{label}</Label>}
      <Select
        value={value}
        onValueChange={(val) => onChange(val as PageRole)}
        disabled={disabled}
      >
        <SelectTrigger id="role-selector" className="w-full">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((role) => (
            <SelectItem key={role} value={role} className="cursor-pointer">
              <div className="flex items-center gap-2">
                {getRoleIcon(role)}
                <div>
                  <div className="font-medium">{formatPageRole(role)}</div>
                  {showDescription && (
                    <div className="text-xs text-muted-foreground max-w-xs">
                      {getPageRoleDescription(role)}
                    </div>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
