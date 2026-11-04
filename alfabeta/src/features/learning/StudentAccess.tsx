import React from 'react';
import type { ComponentType } from 'react';
import { Page, Loading, Notice, Action } from '@/shared/ui';
import { useResource } from './hooks';
import type { Student } from '@/shared/contracts';
// Revalidate on focus before showing a child's screen, including local draft/executor state.
// Navigation 6 screens have heterogeneous params; keep this adapter at the navigation boundary.
export function withStudentAccess(Screen: ComponentType<any>): ComponentType<any> {
  return function StudentAccess(props: any) {
    const sid = props.route.params.student.id as string;
    const resource = useResource<Student>('/students/' + sid);
    if (resource.loading && !resource.data)
      return (
        <Page title="Acompanhamento">
          <Loading />
        </Page>
      );
    if (!resource.data)
      return (
        <Page title="Acesso indisponível">
          <Notice error text={resource.error || 'Esta conta não tem vínculo ativo.'} />
          <Action secondary title="Voltar" onPress={() => props.navigation.goBack()} />
        </Page>
      );
    return (
      <Screen
        {...props}
        route={{ ...props.route, params: { ...props.route.params, student: resource.data } }}
      />
    );
  };
}
