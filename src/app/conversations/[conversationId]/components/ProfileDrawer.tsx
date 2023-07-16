import useOtherUser from '@/app/hooks/useOtherUser';
import { Conversation, User } from '@prisma/client';
import { format } from 'date-fns';
import { FC, useMemo, Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose, IoTrash } from 'react-icons/io5';
import { FiAlertTriangle } from 'react-icons/fi';
import Avatar from '@/app/components/Avatar';
import { Modal, notification } from 'antd';
import service from '@/app/utils/interceptor';
import { useRouter } from 'next/navigation';
import AvatarGroup from '@/app/components/AvatarGroup';
import useActiveList from '@/app/hooks/useActiveList';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: Conversation & {
    users: User[]
  }
};

const ProfileDrawer: FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const otherUser = useOtherUser(data);
  const router = useRouter();

  const { members } = useActiveList();
  const isActive = members.includes(otherUser?.email!);

  const joinedDate = useMemo(() => {
    return format(new Date(otherUser.createAt), 'PP');
  }, [otherUser.createAt]);

  const title = useMemo(() => {
    return data.name || otherUser.name;
  }, [data.name, otherUser.name]);

  const statusText = useMemo(() => {
    if (data.isGroup) {
      return `${data.users.length} members`;
    }
    return isActive ? '在线' : '离线';
  }, [data, isActive]);

  const { confirm } = Modal;

  const showDeleteConfirm = () => {
    confirm({
      title: '删除对话',
      content: '你确定要删除这个对话吗？本次操作不可恢复！',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const result = await service.delete(`/api/conversations/${data.id}`);
        if (result.data.respCode === 0) {
          router.push('/conversations');
          router.refresh();
        } else {
          notification.error({
            message: result?.data?.message,
          });
        }
      },
    });
  };

  return (
    <>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-500'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-500'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div
              className='
              fixed
              inset-0
              bg-black
              bg-opacity-40
            '
            />
          </Transition.Child>
          <div
            className='
            fixed
            inset-0
            overflow-hidden
          '
          >
            <div
              className='
              absolute
              inset-0
              overflow-hidden
            '
            >
              <div
                className='
                pointer-events-none
                fixed
                inset-y-0
                right-0
                flex
                max-w-full
                pl-10
              '
              >
                <Transition.Child
                  as={Fragment}
                  enter='transform transiton ease-in-out duration-500'
                  enterFrom='translate-x-full'
                  enterTo='translate-x-0'
                  leave='transform transiton ease-in-out duration-500'
                  leaveFrom='translate-x-0'
                  leaveTo='translate-x-full'
                >
                  <Dialog.Panel
                    className='
                    pointer-events-auto
                    w-screen
                    max-w-md
                  '
                  >
                    <div
                      className='
                      flex
                      h-full
                      flex-col
                      overflow-y-scroll
                      bg-white
                      py-6
                      shadow-xl
                    '
                    >
                      <div className='px-4 sm:px-6'>
                        <div className='flex items-start justify-end'>
                          <div className='ml-3 flex h-7 items-center'>
                            <button
                              onClick={onClose}
                              type='button'
                              className='
                              rounded-md
                              bg-white
                              text-gray-400
                              hover:text-gray-500
                              focus:outline-none
                              focus:ring-2
                              focus:ring-sky-500
                              focus:ring-offset-2
                            '
                            >
                              <span className='sr-only'>关闭</span>
                              <IoClose size={24} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className='relative mt-6 flex-1 px-4 sm:px-6'>
                        <div className='flex flex-col items-center'>
                          <div className='mb-2'>
                            {data.isGroup ? (
                              <AvatarGroup users={data.users} />
                            ) : (
                              <Avatar user={otherUser} />
                            )}
                          </div>
                          <div>
                            {title}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {statusText}
                          </div>
                          <div className='flex gap-10 my-8'>
                            <div
                              onClick={() => { }}
                              className='
                              flex
                              flex-col
                              gap-3
                              items-center
                              cursor-pointer
                              hover:opacity-75
                            '
                            >
                              <div
                                className='
                                  w-10
                                  h-10
                                  bg-neutral-100
                                  rounded-full
                                  flex
                                  justify-center
                                  items-center
                                '
                                onClick={showDeleteConfirm}
                              >
                                <IoTrash size={20} />
                              </div>
                              <div className='text-sm font-light text-neutral-600'>
                                删除
                              </div>
                            </div>
                          </div>
                          <div className='w-full pb-5 pt-5 sm:px-0 sm:pt-0'>
                            <dl
                              className='
                              space-y-8
                              px-4
                              sm:space-y-6
                              sm:px-6
                            '
                            >
                              {data.isGroup && (
                                <div>
                                  <dt
                                    className='
                                      text-sm
                                      font-medium
                                      text-gray-500
                                      sm:w-40
                                      sm:flex-shrink-0
                                    '
                                  >
                                    邮箱
                                  </dt>
                                  <dd
                                    className='
                                    mt-1
                                    text-sm
                                    text-gray-900
                                    sm:col-span-2
                                  '
                                  >
                                    {data.users.map(user => user.email).join(', ')}
                                  </dd>
                                </div>
                              )}
                              {!data.isGroup && (
                                <div>
                                  <dt
                                    className='
                                    text-sm
                                    font-medium
                                    text-gray-500
                                    sm:w-40
                                    sm:flex-shrink-0
                                  '
                                  >
                                    邮箱
                                  </dt>
                                  <dd
                                    className='
                                    mt-1
                                    text-sm
                                    text-gray-900
                                    sm:col-span-2
                                  '
                                  >
                                    {otherUser.email}
                                  </dd>
                                </div>
                              )}
                              {!data.isGroup && (
                                <>
                                  <hr />
                                  <div>
                                    <dt
                                      className='
                                    text-sm
                                    font-medium
                                    text-gray-500
                                    sm:w-40
                                    sm:flex-shrink-0
                                  '
                                    >
                                      加入时间
                                    </dt>
                                    <dd
                                      className='
                                    mt-1
                                    text-sm
                                    text-gray-900
                                    sm:col-span-2
                                  '
                                    >
                                      <time dateTime={joinedDate}>
                                        {joinedDate}
                                      </time>
                                    </dd>
                                  </div>
                                </>
                              )}
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>

          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default ProfileDrawer;