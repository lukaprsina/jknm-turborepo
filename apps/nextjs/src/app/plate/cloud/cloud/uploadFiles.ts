import * as portiveClient from '@portive/client';
import { type Value, nanoid } from '@udecode/plate-common/server';

import type { FileEvent, PlateCloudEditor, ProgressEvent } from './types';

const createFileEvent = (
  id: string,
  clientFile: portiveClient.ClientFile
): FileEvent => {
  if (clientFile.type === 'image') {
    return {
      file: clientFile.file,
      height: clientFile.height,
      id,
      type: 'image',
      url: clientFile.objectUrl,
      width: clientFile.width,
    };
  }

  return {
    file: clientFile.file,
    id,
    type: 'generic',
    url: clientFile.objectUrl,
  };
};

export const uploadFile = async <V extends Value = Value>(
  editor: PlateCloudEditor<V>,
  file: File
) => {
  const id = `#${nanoid()}`;
  const { client } = editor.cloud;

  const response = await fetch('/s3/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filename: file.name, content_type: file.type }),
  });

  if (response.ok) {
    const { url, fields } = await response.json();

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append('file', file);

    const uploadResponse = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (uploadResponse.ok) {
      // setImageURL(`${url}${fields.key}`);
      console.log('Image URL:', `${url}${fields.key}`);

      /* await insertMedia(editor, {
        type: nodeType,
        getUrl: async () => `${url}${fields.key}`,
      }); */
    } else {
      console.error('S3 Upload Error:', uploadResponse);
      alert('Upload failed.');
    }
  } else {
    alert('Failed to get pre-signed URL.');
  }
};

export const uploadFiles = <V extends Value = Value>(
  editor: PlateCloudEditor<V>,
  files: Iterable<File>
) => {
  void Promise.allSettled(files);
};
