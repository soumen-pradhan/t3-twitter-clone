import { PropsWithChildren } from "react";

export const Layout = (props: PropsWithChildren) => (
    <main className="flex justify-center">
        <div className="md:max-w-2xl w-full border-x border-slate-400 h-screen">
            {props.children}
        </div>
    </main>
)
