import Menu from "components/system/Menu";
import { ChevronRight } from "components/system/Menu/MenuIcons";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { useEffect, useRef, useState } from "react";
import type { Position } from "react-rnd";
import { useTheme } from "styled-components";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";

type MenuItemEntryProps = MenuItem & {
  resetMenu: () => void;
};

const MenuItemEntry = ({
  action,
  disabled,
  icon,
  label,
  menu,
  primary,
  resetMenu,
  seperator,
}: MenuItemEntryProps): JSX.Element => {
  const entryRef = useRef<HTMLLIElement | null>(null);
  const [subMenuOffset, setSubMenuOffset] = useState<Position>({ x: 0, y: 0 });
  const [showSubMenu, setShowSubMenu] = useState(false);
  const { sizes } = useTheme();
  const onMouseEnter: React.MouseEventHandler = () => setShowSubMenu(true);
  const onMouseLeave: React.MouseEventHandler = ({ relatedTarget }) => {
    if (
      !(relatedTarget instanceof HTMLElement) ||
      !entryRef.current?.contains(relatedTarget)
    ) {
      setShowSubMenu(false);
    }
  };
  const subMenuEvents = menu ? { onMouseEnter, onMouseLeave } : {};

  useEffect(() => {
    if (menu && entryRef.current) {
      const { height, width } = entryRef.current.getBoundingClientRect();

      setSubMenuOffset({
        x: width - sizes.contextMenu.subMenuOffset,
        y: -height - sizes.contextMenu.subMenuOffset,
      });
    }
  }, [menu, sizes.contextMenu.subMenuOffset]);

  return (
    <li
      className={disabled ? "disabled" : ""}
      ref={entryRef}
      {...subMenuEvents}
    >
      {seperator ? (
        <hr />
      ) : (
        <Button
          as="figure"
          className={showSubMenu ? "active" : ""}
          onClick={() => {
            if (!menu) {
              action?.();
              resetMenu();
            }
          }}
        >
          {icon && <Icon src={icon} alt={label} imgSize={16} />}
          <figcaption className={primary ? "primary" : ""}>{label}</figcaption>
          {menu && <ChevronRight />}
        </Button>
      )}
      {showSubMenu && <Menu subMenu={{ items: menu, ...subMenuOffset }} />}
    </li>
  );
};

export default MenuItemEntry;
