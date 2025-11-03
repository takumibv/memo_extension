import { GlobalStyle, SContainer, STitle, SSettingSection, SSettingTitle, SSettingDescription } from './Options.style';
import { sendUpdateDefaultColor, sendFetchSetting } from '../../../chrome-extension/src/message/sender/options';
import { ColorPicker } from '@extension/shared/lib/components';
import { useEffect, useState } from 'react';
import type React from 'react';

const Options: React.FC = () => {
  const [defaultColor, setDefaultColor] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onClickDefaultColor = (color: string) => {
    sendUpdateDefaultColor(color).then(({ setting }) => {
      setDefaultColor(setting?.default_color ?? '');
    });
  };

  useEffect(() => {
    setIsLoading(true);
    sendFetchSetting()
      .then(({ setting }) => {
        setDefaultColor(setting?.default_color ?? '');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <GlobalStyle />
      <SContainer>
        <STitle>設定</STitle>
        {!isLoading && (
          <SSettingSection>
            <SSettingTitle>デフォルトカラー</SSettingTitle>
            <SSettingDescription>新しく作成するメモのデフォルトカラーを設定できます。</SSettingDescription>
            <ColorPicker color={defaultColor} onChangeColor={onClickDefaultColor} />
          </SSettingSection>
        )}
      </SContainer>
    </>
  );
};

export default Options;
