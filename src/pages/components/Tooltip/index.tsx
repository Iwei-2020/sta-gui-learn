import { ExclamationCircleFilled } from '@ant-design/icons';
import { useSearchParams } from '@umijs/max';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const iconColorMap: Record<string, string> = {
  error: '#a71f27',
  warning: '#d89715',
  notice: '#1b56cb',
};
const TooltipPage: React.FC = React.memo(() => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState<string>('');
  const channelName = searchParams.get('channelName');
  const [type, setType] = useState<string>('');

  useEffect(() => {
    if (!channelName) return;
    const channel = new BroadcastChannel(channelName);
    const handler = (event: MessageEvent) => {
      const msg = event.data?.content as string;
      const type = event.data?.type as string;
      if (msg && type) {
        setMessage(msg);
        setType(type);
        channel.close();
      }
    };

    channel.addEventListener('message', handler);
    channel.postMessage({ type: 'ready' });
    return () => {
      channel.removeEventListener('message', handler);
      channel.close();
    };
  }, [channelName]);

  const close = () => {
    window.close();
  };
  return (
    <div className={styles['tooltip-modal']}>
      <div className={styles['tooltip-content']}>
        <ExclamationCircleFilled
          className={styles['tooltip-icon']}
          style={{ color: iconColorMap[type] }}
        />
        <div className={styles['tooltip-message']}>{message}</div>
      </div>
      <Button className={styles['confirm-btn']} onClick={close}>
        OK
      </Button>
    </div>
  );
});
export default TooltipPage;
