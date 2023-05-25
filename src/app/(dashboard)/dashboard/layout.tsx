import { Icon, Icons } from '@/components/Icons'
import SignOutButton from '@/components/SignOutButton'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FC, ReactNode } from 'react'
// import { fetchRedis } from '@/helpers/redis'
import SidebarChatList from '@/components/SidebarChatList'
import { SidebarOption } from '@/types/typing'
import { fetchRedis } from '@/app/helpers/redis'
import FriendRequestSidebarOptions from '@/components/FriendRequestsSidebarOption'
import { getFriendsByUserId } from '@/app/helpers/get-friends-by-user-id'
import MobileChatLayout from '@/components/MobileChatLayout'
import DefaultChatLayout from '@/components/DefaultChatLayout'

interface LayoutProps {
  children: ReactNode
}

// Done after the video and optional: add page metadata
export const metadata = {
  title: 'FriendZone | Dashboard',
  description: 'Your dashboard'
}

const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: 'Add friend',
    href: '/dashboard/add',
    Icon: 'UserPlus'
  }
]

const Layout = async ({ children }: LayoutProps) => {
  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const friends = await getFriendsByUserId(session.user.id)

  const unseenRequestCount = (
    (await fetchRedis(
      'smembers',
      `user:${session.user.id}:incoming_friend_requests`
    )) as User[]
  ).length

  return (
    <div className="w-full flex h-screen">
      <div className="md:hidden">
        <MobileChatLayout
          friends={friends}
          session={session}
          sidebarOptions={sidebarOptions}
          unseenRequestCount={unseenRequestCount}
        />
      </div>

      <div className="hidden md:flex h-full w-full max-w-sm grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
          <Icons.Logo className="h-8 w-auto text-indigo-600" />
        </Link>

        {friends.length > 0 ? (
          <div className="text-xs font-semibold leading-6 text-gray-400">
            Your chats
          </div>
        ) : null}

        <nav className="flex flex-1 flex-col">
          <DefaultChatLayout
            friends={friends}
            session={session}
            sidebarOptions={sidebarOptions}
            unseenRequestCount={unseenRequestCount}
          />
        </nav>
      </div>

      <aside className="max-h-screen container px-5 py-16 md:py-12 w-full">
        {children}
      </aside>
    </div>
  )
}

export default Layout
