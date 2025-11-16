import { GlobalStyle, SContainer, STitle, SSettingSection, SSettingTitle } from './Options.style';
import { sendUpdateDefaultColor, sendFetchSetting } from '../../../chrome-extension/src/message/sender/options';
import { t } from '@extension/i18n';
import { ColorPicker } from '@extension/shared/lib/components';
import { I18N } from '@extension/shared/lib/i18n/keys';
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
        <STitle>{t(I18N.SETTINGS_HEADER)}</STitle>
        {!isLoading && (
          <SSettingSection>
            <SSettingTitle>{t(I18N.DEFAULT_COLOR)}</SSettingTitle>
            <ColorPicker color={defaultColor} onChangeColor={onClickDefaultColor} />
          </SSettingSection>
        )}
      </SContainer>
    </>
  );
};

export default Options;
