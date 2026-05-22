import { Route } from ".";

const eco: Route = {
  name: "eco",
  path: "/eco",
  title: "ECO",
  layout: true,
  routes: [
    {
      name: "insert-buffer",
      path: "/eco/insertBuffer",
      component: "@/pages/components/Eco/InsertBuffer",
      title: "Insert Buffer",
      layout: true,
    },
    {
      name: "object-chooser",
      path: "/eco/objectChooser",
      component: "@/pages/components/Eco/ObjectChooser",
      title: "Object Chooser",
      layout: true,
    },
    {
      name: "size-cell",
      path: "/eco/sizeCell",
      component: "@/pages/components/Eco/SizeCell",
      title: "Size Cell",
      layout: true,
    },
    {
      name: "remove-buffer",
      path: "/eco/removeBuffer",
      component: "@/pages/components/Eco/RemoveBuffer",
      title: "Remove Buffer",
      layout: true,
    },
  ],
};

export default eco;
