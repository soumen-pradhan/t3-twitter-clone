import { PropsWithChildren } from "react";

export const Layout = (props: PropsWithChildren) => (
    <main className="flex justify-center h-screen overflow-none">
        <div className="md:max-w-2xl w-full h-full border-x border-slate-400 overflow-y-scroll">
            {props.children}
        </div>
    </main>
)
