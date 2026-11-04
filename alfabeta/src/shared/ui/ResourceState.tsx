import React from 'react';
import { Stack, Notice, Action } from '@/shared/ui';
import { Skeleton } from './Skeleton';
import type { useCommand } from '@/shared/data/hooks';
export function LoadState({
  resource,
}: {
  resource: { loading: boolean; error: string; reload: () => Promise<void> };
}) {
  return resource.loading ? (
    <Skeleton />
  ) : resource.error ? (
    <Stack>
      <Notice error text={resource.error} />
      <Action secondary title="Tentar novamente" onPress={() => void resource.reload()} />
    </Stack>
  ) : null;
}
export function SaveState({ command }: { command: ReturnType<typeof useCommand> }) {
  return (
    <>
      {command.message ? <Notice text={command.message} /> : null}
      {command.error ? <Notice error text={command.error} /> : null}
    </>
  );
}
