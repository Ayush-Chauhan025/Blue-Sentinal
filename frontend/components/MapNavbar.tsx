import { SignOut } from "@/app/login/actions";
import { Menu, User } from "lucide-react";
import { useState } from "react";

export default function NavBar() {
    const [open, setOpen] = useState<boolean>(false);


    return (
        <nav className="fixed top-0 left-0 z-10 flex h-[10dvh] min-h-14 max-h-20 w-full items-center justify-between  px-4 font-black">
            <button
                type="button"
                aria-label="Open menu"
                className="grid size-10 cursor-pointer place-items-center rounded-full transition bg-white duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
                <Menu size={22} color="black" />
            </button>

            {/* <span className="text-xl uppercase tracking-tight">Brand</span> */}

            <div className="relative">
                <button
                    type="button"
                    aria-label="Account"
                    className="relative grid size-10 cursor-pointer place-items-center rounded-full border-2 border-black bg-white transition duration-150 hover:bg-gray-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                    onClick={() => setOpen(!open)}
                >
                    <User size={20} color="black"/>
                </button>
                {open && <div className="absolute flex flex-col top-full z-10 bg-white right-2 p-2">
                    <button className="p-2 rounded-md broder-b text-white mb-1 bg-blue-500 active:bg-white active:text-blue-600 transition">
                        Profile
                    </button>
                    <form action={SignOut}>
                        <button type="submit" className="text-red-500 p-2 rounded-md broder-b mb-1 active:text-white active:bg-red-600 transition">
                            SignOut
                        </button>
                    </form>
                </div>}
            </div>
        </nav>
    );
}