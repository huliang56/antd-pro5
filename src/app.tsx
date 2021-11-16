import type { Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import type { RunTimeLayoutConfig, RequestConfig } from 'umi';
import { history, Link } from 'umi';
import MultiTabs from '@/components/MultiTabs';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import { getSysMenus } from '@/services/common';
import { getFlattenMenuData, filterAccessibleMenu } from '@/utils/index';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
// 默认可访问路径
const defaultPaths = ['/', '/welcome', '/index.html', '/user', '/user/login'];

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  accessiblePaths: string[];
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const fetchSysMenus = async (params: any) => {
    try {
      const res = await getSysMenus(params);
      return res.menu;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };

  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    const sysMenus = await fetchSysMenus({ sysId: 24, username: 'admin', mobile: 13918776407 });
    const accessiblePaths = getFlattenMenuData(sysMenus).map((i) => i.path || '');
    return {
      fetchUserInfo,
      currentUser,
      settings: {},
      accessiblePaths,
    };
  }
  return {
    fetchUserInfo,
    settings: {},
    accessiblePaths: [],
  };
}

export const request: RequestConfig = {
  timeout: 6e4,
  errorConfig: {
    // adaptor
  },
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('mscode_token'),
  },
  middlewares: [],
  requestInterceptors: [],
  responseInterceptors: [],
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    childrenRender: () => <MultiTabs />,
    rightContentRender: () => <RightContent />,
    disableContentMargin: true,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && history.location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    menuDataRender(menuData: MenuDataItem[]) {
      const accessiblePaths = [...defaultPaths, ...(initialState?.accessiblePaths || [])];
      return filterAccessibleMenu(menuData, accessiblePaths);
    },
    links: isDev
      ? [
          <Link to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
          <Link to="/~docs">
            <BookOutlined />
            <span>业务组件文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};
