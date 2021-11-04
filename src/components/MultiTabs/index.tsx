import { useState, useEffect } from 'react';
import type { TabsProps } from 'antd';
import { Tabs } from 'antd';
import { history } from 'umi';
import type { RouteContextType, MenuDataItem } from '@ant-design/pro-layout';
import { RouteContext } from '@ant-design/pro-layout';
import { getFlattenMenuData } from '@/utils/index';
import './index.less';

const initialPanes: MenuDataItem[] = [{ name: '欢迎', path: '/welcome', closable: false }];

const MultiTabs: React.FC<{ routeContext: RouteContextType }> = (props) => {
  const { currentMenu, menuData } = props.routeContext;
  const menus = getFlattenMenuData(menuData);
  const noLayoutPaths = menus.filter((i) => i.layout === false).map((i) => i.path);
  const isNoLayoutPath = currentMenu?.path && noLayoutPaths.includes(currentMenu.path);

  const [activeKey, setActiveKey] = useState(initialPanes[0].path);
  const [panes, setPanes] = useState(initialPanes);

  useEffect(() => {
    const currentPath = currentMenu?.path;
    if (!currentPath) {
      return history.replace('');
    }

    if (isNoLayoutPath) {
      return currentMenu.redirect && history.replace(currentMenu.redirect || '');
    }

    if (currentPath && menus?.length) {
      setActiveKey(currentPath);

      const currentPane = panes.find((i) => i.path === currentPath);
      if (!currentPane) {
        const currentRoute = menus.find((i) => i.path === currentPath);
        if (!currentRoute || currentRoute.redirect || !currentRoute.component) {
          const defaultChildrenRoute = currentRoute?.children ? currentRoute?.children[0].path : '';
          return history.replace(currentRoute?.redirect || defaultChildrenRoute || '');
        }
        const newPanes = [...panes, currentRoute];
        newPanes[0].closable = false;
        setPanes(newPanes);
      } else if (!currentPane.component) {
        const newPanes = panes.map((i) => menus.find((o) => o.path === i.path) || i);
        newPanes[0].closable = false;
        setPanes(newPanes);
      }
    }
  }, [currentMenu, isNoLayoutPath, menus, panes]);

  const onChange = (tabKey: string) => {
    setActiveKey(tabKey);
    history.push(tabKey);
  };

  const onEdit: TabsProps['onEdit'] = (targetKey, action) => {
    if (action === 'remove') {
      let newActiveKey = activeKey;
      let lastIndex = 0;
      panes.forEach((pane, i) => {
        if (pane.path === targetKey) {
          lastIndex = i - 1;
        }
      });
      const newPanes = panes.filter((pane) => pane.path !== targetKey);
      if (newPanes.length && newActiveKey === targetKey) {
        newActiveKey = newPanes[lastIndex >= 0 ? lastIndex : 0].path;
      }
      if (newActiveKey) {
        setPanes(newPanes);
        setActiveKey(newActiveKey);
        history.push(newActiveKey);
      }
    }
  };

  if (isNoLayoutPath) {
    const Component = currentMenu?.component;
    return Component ? <Component /> : null;
  }

  return (
    <div className="multi-tabs-container">
      <Tabs type="editable-card" activeKey={activeKey} hideAdd onChange={onChange} onEdit={onEdit}>
        {panes.map((pane) => {
          const { component: Component } = pane;
          return (
            <Tabs.TabPane tab={pane.name} key={pane.path} closable={pane.closable}>
              {Component ? <Component /> : null}
            </Tabs.TabPane>
          );
        })}
      </Tabs>
    </div>
  );
};

export default () => (
  <RouteContext.Consumer>
    {(value: RouteContextType) => <MultiTabs routeContext={value} />}
  </RouteContext.Consumer>
);
