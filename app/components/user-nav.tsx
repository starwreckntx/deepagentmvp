
'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';

export function UserNav() {
  const { data: session } = useSession() || {};

  if (!session?.user) return null;

  const userInitials = session.user.name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {session.user.name && (
              <p className="font-medium">{session.user.name}</p>
            )}
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
            signOut({ callbackUrl: '/auth/signin' });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
