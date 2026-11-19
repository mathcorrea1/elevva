import { useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Download } from 'lucide-react-native';
import { Action, Copy, Notice } from '@/shared/ui';
import { Sheet } from '@/shared/ui/Sheet';
import { Pills } from '@/shared/ui/learning';
import { repository, operationId } from '@/shared/http/repository';
import { sessionGeneration } from '@/features/auth/session';
type PDF = { filename: string; mime_type: string; base64: string };
export function ExportPDF({ path, period }: { path: string; period: string }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState('summary');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const running = useRef(false);
  async function download() {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    setDone(false);
    const account = sessionGeneration();
    let temporary: string | null = null;
    try {
      const file = await repository.get<PDF>(path + (period || '?') + '&detail=' + detail);
      if (account !== sessionGeneration())
        throw new Error('Conta alterada. Exporte novamente pela conta atual.');
      if (file.mime_type !== 'application/pdf' || !file.base64.startsWith('JVBERi0'))
        throw new Error('O servidor não retornou um PDF válido.');
      if (Platform.OS === 'web') {
        const bytes = Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: file.mime_type }));
        const link = document.createElement('a');
        link.href = url;
        link.download = file.filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      } else {
        if (!(await Sharing.isAvailableAsync()) || !FileSystem.cacheDirectory)
          throw new Error('Compartilhamento de arquivos indisponível neste aparelho.');
        temporary = FileSystem.cacheDirectory + 'elevva-' + operationId() + '.pdf';
        await FileSystem.writeAsStringAsync(temporary, file.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (account !== sessionGeneration())
          throw new Error('Conta alterada. Exporte novamente pela conta atual.');
        await Sharing.shareAsync(temporary, {
          mimeType: file.mime_type,
          UTI: 'com.adobe.pdf',
          dialogTitle: 'Salvar ou compartilhar relatório',
        });
      }
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (temporary) await FileSystem.deleteAsync(temporary, { idempotent: true }).catch(() => {});
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <Action secondary icon={Download} title="Exportar PDF" onPress={() => setOpen(true)} />
      <Sheet
        visible={open}
        title="Seu relatório em PDF"
        close={() => {
          if (!busy) setOpen(false);
        }}
        footer={
          <Action
            icon={Download}
            title={busy ? 'Preparando PDF…' : 'Baixar ou compartilhar PDF'}
            disabled={busy}
            onPress={() => void download()}
          />
        }
      >
        <Copy>Usa o período selecionado e os registros autorizados desta tela.</Copy>
        <Pills
          options={[
            { value: 'summary', label: 'Resumido' },
            { value: 'detailed', label: 'Detalhado' },
          ]}
          value={detail}
          onChange={(v) => {
            if (!busy) {
              setDetail(v);
              setDone(false);
            }
          }}
        />
        <Copy muted size="caption">
          Informações clínicas e notas restritas ficam fora da exportação. Ao compartilhar, confira
          o destinatário.
        </Copy>
        {!!error && <Notice error text={error} />}
        {done && (
          <Notice
            text={
              Platform.OS === 'web'
                ? 'PDF enviado aos downloads do navegador.'
                : 'PDF preparado. O destino depende da opção escolhida no aparelho.'
            }
          />
        )}
      </Sheet>
    </>
  );
}
