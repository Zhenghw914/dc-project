const svgModules = import.meta.glob('../../assets/icons/*.svg', { eager: true }); // 根据 icons 文件夹的相对路径修改

const svgCache = new Map();

export function useSvgIcon() {
  const getIcon = (name) => {
    if (svgCache.has(name)) {
      return svgCache.get(name);
    }

    const svgPath = `../../assets/icons/${name}.svg`; // 根据实际路径更新
    const svgModule = svgModules[svgPath];
    if (svgModule) {
      svgCache.set(name, svgModule.default);
      return svgModule.default;
    }

    console.warn(`SVG Icon "${name}" not found in icons folder.`);
    return null;
  };

  return { getIcon };
}
