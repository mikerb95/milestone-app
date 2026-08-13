"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./nav";
import { Fab } from "./fab";

/**
 * El detalle de meta convive con la lista en escritorio, así que el shell
 * necesita saber si hay un panel abierto para correr el contenido.
 */
export function Shell({
  todayBadge,
  children,
}: {
  todayBadge: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const detailOpen = /^\/goals\/[^/]+$/.test(pathname);

  return (
    <div className="ms-shell" data-detail={detailOpen ? "true" : "false"}>
      <Nav todayBadge={todayBadge} />
      <main className="ms-main">{children}</main>
      <Fab />
    </div>
  );
}
