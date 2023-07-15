'use client';

import useConversation from '@/app/hooks/useConversation';
import service from '@/app/utils/interceptor';
import { FC } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { HiPaperAirplane, HiPhoto } from 'react-icons/hi2';
import MessageInput from './MessageInput';
import { CldUploadButton } from 'next-cloudinary';

interface FormProps { };

const Form: FC<FormProps> = ({ }) => {
  const { conversationId } = useConversation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: {
      errors,
    },
  } = useForm<FieldValues>({
    defaultValues: {
      message: '',
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue('message', '', { shouldValidate: true });

    service.post('/api/messages', {
      ...data,
      conversationId,
    });
  };

  const handleUpload = (result: any) => {
    service.post('/api/messages', {
      image: result?.info?.secure_url,
      conversationId,
    });
  };

  return (
    <div
      className='
        py-4
        px-4
        bg-white
        border-t
        flex
        items-center
        gap-2
        lg:gap-4
        w-full
      '
    >
      <CldUploadButton
        options={{maxFiles: 1}}
        onUpload={handleUpload}
        uploadPreset='uuyw9lhd'
      >
        <HiPhoto size={30} className='text-sky-500 cursor-pointer hover:text-sky-600' />
      </CldUploadButton>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex items-center gap-2 lg:gap-4 w-full'
      >
        <MessageInput
          id='message'
          register={register}
          errors={errors}
          required
        />
        <button
          type='submit'
          className='
            rounded-full
            p-2
            bg-sky-500
            cursor-pointer
            hover:bg-sky-600
            transition
          '
        >
          <HiPaperAirplane
            size={18}
            className='text-white'
          />
        </button>
      </form>
    </div>
  );
};

export default Form;