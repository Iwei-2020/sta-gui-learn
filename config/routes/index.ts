import application from "./application";
import def from "./def";
import eco from "./eco";
import exit from "./exit";
import lef from "./lef";
import liberty from "./liberty";
import netlist from "./netlist";
import objectChooser from "./objectChooser";
import sdc from "./sdc";
import spefsdf from "./spefsdf";
import timingPaths from "./timingPaths";
import tooltip from "./tooltip";

export interface Route {
  path?: string;
  component?: string;
  redirect?: string;
  routes?: Route[];
  title?: string;
  exact?: boolean;
  wrappers?: string[];
  /** 命名路由 */
  name?: string; // 有值会展示在layout目录中
  layout?: boolean; // 使不使用默认layout布局
}

const basic: Route = {
  path: "/",
  component: "@/layouts/index",
  name: "STA",
  routes: [
    {
      path: "/",
      title: "STAGUI",
      name: "STAGUI",
      component: "@/pages/index",
    },
  ],
};

const routes: Route[] = [
  basic,
  liberty,
  netlist,
  def,
  lef,
  spefsdf,
  sdc,
  application,
  timingPaths,
  objectChooser,
  tooltip,
  exit,
  eco,
];

export default routes;
