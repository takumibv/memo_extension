import { sendUpdateDefaultColor, sendFetchSetting } from '@/message/sender/options';
import { ColorPicker } from '@/shared/components/ColorPicker';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { useEffect, useState } from 'react';

const Options = () => {
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
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">{t(I18N.SETTINGS_HEADER)}</h1>
      {!isLoading && (
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="mb-4 text-lg font-semibold">{t(I18N.DEFAULT_COLOR)}</h2>
          <p className="mb-4 text-sm text-gray-500">{t(I18N.DEFAULT_COLOR_DESCRIPTION)}</p>
          <ColorPicker color={defaultColor} onChangeColor={onClickDefaultColor} />
        </div>
      )}
    </div>
  );
};

export default Options;
