'use client'

import { pusherClient } from '@/lib/pusher'
import { playSound, toPusherKey } from '@/lib/utils'
import { User } from 'lucide-react'
import { usePathname } from 'next/dist/client/components/navigation'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import IncomingFriendRequestToast from './IncomingFriendRequestToast'

interface FriendRequestSidebarOptionsProps {
  sessionId: string
  initialUnseenRequestCount: number
}

interface ExtendIncomingFriendRequest extends IncomingFriendRequest {
  senderName: string
  senderImg: string
}

const FriendRequestSidebarOptions: FC<FriendRequestSidebarOptionsProps> = ({
  sessionId,
  initialUnseenRequestCount
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount
  )
  const pathname = usePathname()
  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    )
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

    const friendRequestHandler = ({
      senderId,
      senderImg,
      senderName
    }: ExtendIncomingFriendRequest) => {
      setUnseenRequestCount((prev) => prev + 1)

      const shouldNotify = pathname !== `/dashboard/requests`
      if (!shouldNotify) return

      playSound()
      // SHOULD BE NOTIFY
      toast.custom(
        (t) => (
          <IncomingFriendRequestToast
            t={t}
            sessionId={sessionId}
            senderId={senderId}
            senderImg={senderImg}
            senderName={senderName}
          />
        ),
        { id: 'noty-incoming-friend-request' }
      )
    }

    const addedFriendHandler = () => {
      setUnseenRequestCount((prev) => prev - 1)
    }

    pusherClient.bind('incoming_friend_requests', friendRequestHandler)
    pusherClient.bind('new_friend', addedFriendHandler)

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      )
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

      pusherClient.unbind('new_friend', addedFriendHandler)
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
    }
  }, [sessionId, pathname])

  return (
    <>
      <Link
        href="/dashboard/requests"
        className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
      >
        <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
          <User className="h-4 w-4" />
        </div>
        <p className="truncate">Friend requests</p>

        {unseenRequestCount > 0 ? (
          <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
            {unseenRequestCount}
          </div>
        ) : null}
      </Link>
    </>
  )
}

export default FriendRequestSidebarOptions
