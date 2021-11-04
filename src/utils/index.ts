import type { MenuDataItem } from '@ant-design/pro-layout';

/**
 * 展平菜单信息
 * @param menuData
 */
export const getFlattenMenuData = (menuData?: MenuDataItem[]) => {
  const data: MenuDataItem[] = [];
  if (!menuData || !menuData.length) {
    return data;
  }

  const polling = (routes: MenuDataItem[]) => {
    routes.forEach((i) => {
      data.push(i);
      if (i.children) {
        polling(i.children);
      }
      if (i.routes) {
        polling(i.routes);
      }
    });
  };
  polling(menuData);

  return data;
};

/**
 * 根据可访问路径，过滤菜单项
 */
export const filterAccessibleMenu = (
  menuData: MenuDataItem[] = [],
  accessiblePaths: string[] = [],
): MenuDataItem[] =>
  menuData
    .map((item) => {
      const childrenMenus = filterAccessibleMenu(item.children, accessiblePaths);
      if ((item.path && accessiblePaths.includes(item.path)) || childrenMenus.length > 0) {
        return { ...item, children: childrenMenus };
      }
      return undefined;
    })
    .filter((item) => item) as MenuDataItem[];
