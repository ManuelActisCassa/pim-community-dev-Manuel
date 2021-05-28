import React, {FC, useEffect, useState} from 'react';
import {useParams} from 'react-router';
import {Breadcrumb} from 'akeneo-design-system';
import {
  BreadcrumbStepSkeleton,
  FullScreenError,
  PageContent,
  PageHeader,
  PimView,
  useRouter,
  useSetPageTitle,
  useTranslate,
  useUserContext,
} from '@akeneo-pim-community/shared';
import {useCategory} from '../../hooks';
import {Category} from '../../models';

type Params = {
  categoryId: string;
};

const CategoryEditPage: FC = () => {
  const {categoryId} = useParams<Params>();
  const translate = useTranslate();
  const router = useRouter();
  const userContext = useUserContext();
  const {category, status, load} = useCategory(parseInt(categoryId));
  const [categoryLabel, setCategoryLabel] = useState('');
  const [treeLabel, setTreeLabel] = useState('');
  const [tree, setTree] = useState<Category | null>(null);

  useSetPageTitle(translate('pim_title.pim_enrich_categorytree_edit', {'category.label': categoryLabel}));

  const followSettingsIndex = () => router.redirect(router.generate('pim_enrich_attribute_index'));
  const followCategoriesIndex = () => router.redirect(router.generate('pim_enrich_categorytree_index'));
  const followCategoryTree = () => {
    if (!tree) {
      return;
    }
    router.redirect(router.generate('pim_enrich_categorytree_tree', {id: tree.id}));
  };

  useEffect(() => {
    load();
  }, [categoryId]);

  useEffect(() => {
    if (category === null) {
      setCategoryLabel('');
      setTreeLabel('');
      setTree(null);
      return;
    }

    const uiLocale = userContext.get('uiLocale');
    const rootCategory = category && category.root ? category.root : category;

    setCategoryLabel(
      category && category.labels.hasOwnProperty(uiLocale) ? category.labels[uiLocale] : `[${category.code}]`
    );
    setTreeLabel(
      rootCategory && rootCategory.labels.hasOwnProperty(uiLocale)
        ? rootCategory.labels[userContext.get('uiLocale')]
        : `[${rootCategory.code}]`
    );
    setTree(rootCategory);
  }, [category]);

  if (status === 'error') {
    return (
      <FullScreenError
        title={translate('error.exception', {status_code: '404'})}
        message={translate('pim_enrich.entity.category.content.edit.not_found')}
        code={404}
      />
    );
  }

  return (
    <>
      <PageHeader showPlaceholder={status === 'idle' || status === 'fetching'}>
        <PageHeader.Breadcrumb>
          <Breadcrumb>
            <Breadcrumb.Step onClick={followSettingsIndex}>{translate('pim_menu.tab.settings')}</Breadcrumb.Step>
            <Breadcrumb.Step onClick={followCategoriesIndex}>
              {translate('pim_enrich.entity.category.plural_label')}
            </Breadcrumb.Step>
            <Breadcrumb.Step onClick={followCategoryTree}>{treeLabel || <BreadcrumbStepSkeleton />}</Breadcrumb.Step>
            <Breadcrumb.Step>{categoryLabel || <BreadcrumbStepSkeleton />}</Breadcrumb.Step>
          </Breadcrumb>
        </PageHeader.Breadcrumb>
        <PageHeader.UserActions>
          <PimView
            viewName="pim-menu-user-navigation"
            className="AknTitleContainer-userMenuContainer AknTitleContainer-userMenu"
          />
        </PageHeader.UserActions>
        <PageHeader.Title>{categoryLabel}</PageHeader.Title>
      </PageHeader>
      <PageContent>Edit {categoryLabel}</PageContent>
    </>
  );
};
export {CategoryEditPage};
