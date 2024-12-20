"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  HoveredLink,
  Menu,
  MenuItem,
  ProductItem,
} from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import { Session } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { v4 } from "uuid";

import { useUserStatusStore } from "@/stores/userStatusStore";
import SwitchToolTipWrapper from "./ui/switchWrapper";

const Navbar = ({
  className,
  authStatus,
  signOut,
  userHasOrganization,
}: {
  className?: string;
  authStatus?: Session | undefined;
  signOut: () => void;
  userHasOrganization: boolean;
}) => {
  const [active, setActive] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState<Boolean>(false);

  const handleBurgerToggle = () => {
    setIsOpen((prevState) => !prevState);
  };

  const { userStatus, changeUserStatus } = useUserStatusStore((state) => state);

  return (
    <>
      <div className="flex h-24 w-[100%] flex-row justify-between items-center m-auto py-1 px-14 2xl:px-20 sticky z-[40] shadow-lg">
        <Link className="text-2xl cursor-pointer min-w-[240px]" href="/">
          <div className="flex flex-col justify-center items-center">
            <img
              src="/Favicon.png"
              alt="Volunteer Opportunities Logo"
              width={"30px"}
              height={"30px"}
              className="float-left mr-[15px]"
            />
            <h1 className="text-lg font-bold">Volunteer Opportunities</h1>
          </div>
        </Link>

        {authStatus?.user ? (
          <>
            <div className="flex xl:hidden relative z-[50]">
              <Sheet onOpenChange={handleBurgerToggle}>
                <SheetTrigger>
                  <div className="flex flex-col justify-between w-6 h-4 cursor-pointer">
                    <div
                      className={`w-full h-0.5 bg-black transition-transform transform origin-center ${
                        isOpen
                          ? "rotate-45 translate-y-[7px]"
                          : "rotate-0 translate-y-0"
                      }`}
                    ></div>
                    <div
                      className={`w-full h-0.5 bg-black transition-opacity ${
                        isOpen ? "opacity-0" : "opacity-100"
                      }`}
                    ></div>
                    <div
                      className={`w-full h-0.5 bg-black transition-transform transform origin-center ${
                        isOpen
                          ? "-rotate-45 -translate-y-[7px]"
                          : "rotate-0 translate-y-0"
                      }`}
                    ></div>
                  </div>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[90%] md:w-1/2 overflow-y-scroll hidden-scrollbar"
                >
                  <SheetHeader className="h-full">
                    <SheetTitle>
                      <SheetClose asChild>
                        <Link href={"/"}>
                          <div className="flex flex-col justify-center items-center">
                            <img
                              src="/Favicon.png"
                              alt="Volunteer Opportunities Logo"
                              className="w-[40px] h-[40px]"
                            />
                            <h1>Volunteer Opportunities</h1>
                          </div>
                        </Link>
                      </SheetClose>
                    </SheetTitle>
                    <SheetDescription className="h-full overflow-auto">
                      <div className="flex flex-col justify-between h-full">
                        <div className="flex justify-start flex-col gap-5 mt-2">
                          <div className="flex flex-col gap-2">
                            <h1 className="font-medium text-xl text-black">
                              Explore
                            </h1>
                            <div className="ml-5 flex flex-col gap-3">
                              <SheetClose asChild>
                                <Link href={"/explore"} className="block">
                                  Search for listings that suit you
                                </Link>
                              </SheetClose>
                            </div>
                          </div>
                          <div className="flex justify-start flex-col gap-5">
                            <div className="flex flex-col gap-2">
                              <h1 className="font-medium text-xl text-black">
                                Message
                              </h1>
                              <div className="ml-5 flex flex-col gap-3">
                                <SheetClose asChild>
                                  <Link href="/message">
                                    Message other users who need your help
                                  </Link>
                                </SheetClose>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-start flex-col gap-5">
                            <div className="flex flex-col gap-2">
                              <h1 className="font-medium text-xl text-black">
                                Create
                              </h1>
                              <div className="ml-5 flex flex-col gap-3">
                                {!userStatus ? (
                                  <SheetClose asChild>
                                    <Link href="/profile/view">
                                      Create an organization for your account
                                    </Link>
                                  </SheetClose>
                                ) : (
                                  <SheetClose asChild>
                                    <Link href="/create/listing">
                                      Create a listing for your current
                                      organization
                                    </Link>
                                  </SheetClose>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-start flex-col gap-5">
                            <div className="flex flex-col gap-2">
                              <h1 className="font-medium text-xl text-black">
                                Profile
                              </h1>
                              <div className="ml-5 flex flex-col gap-3">
                                <SheetClose asChild>
                                  <Link
                                    href={"/profile/view"}
                                    className="block"
                                  >
                                    View Profile
                                  </Link>
                                </SheetClose>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center pl-5 min-w-[200px] text-black">
                            {userStatus ? (
                              <p>Organization</p>
                            ) : (
                              <p>Volunteer</p>
                            )}
                            <SwitchToolTipWrapper
                              checked={userStatus}
                              setChecked={changeUserStatus}
                              specialKey={"switch1"}
                              userHasOrganization={userHasOrganization}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col w-full p-4 gap-3">
                          <ProductItem
                            title={authStatus?.user.name || ""}
                            description={authStatus?.user.email || ""}
                            src={
                              authStatus?.user.image || "/blank_profile_pic.png"
                            }
                            customClassName="w-[60px] h-[60px]"
                          ></ProductItem>
                          <SheetClose asChild>
                            <Button
                              onClick={() => signOut()}
                              className="w-full"
                              variant={"destructive"}
                            >
                              Sign Out
                            </Button>
                          </SheetClose>
                        </div>
                      </div>
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
            <div className={cn("hidden xl:block ", className)}>
              <Menu setActive={setActive}>
                <HoveredLink href="/explore">
                  <MenuItem
                    setActive={setActive}
                    active={active}
                    item="Explore"
                  >
                    <div className="flex flex-col space-y-4 text-sm">
                      Search for listings that suit you
                    </div>
                  </MenuItem>
                </HoveredLink>

                {!userStatus ? (
                  <HoveredLink href="/profile/view">
                    <MenuItem
                      setActive={setActive}
                      active={active}
                      item="Create"
                    >
                      <div className="flex flex-col space-y-4 text-sm">
                        Create an organization for your account
                      </div>
                    </MenuItem>
                  </HoveredLink>
                ) : (
                  <HoveredLink href="/create/listing">
                    <MenuItem
                      setActive={setActive}
                      active={active}
                      item="Create"
                    >
                      <div className="flex flex-col space-y-4 text-sm">
                        Create a listing for your current organization
                      </div>
                    </MenuItem>
                  </HoveredLink>
                )}

                <HoveredLink href="/message">
                  <MenuItem
                    setActive={setActive}
                    active={active}
                    item="Message"
                  >
                    <div className="flex flex-col space-y-4 text-sm">
                      Message other users who need your help
                    </div>
                  </MenuItem>
                </HoveredLink>
              </Menu>
            </div>
            <div className="hidden xl:flex flex-row items-center justify-start ">
              <Menu setActive={setActive} className="p-0">
                <MenuItem setActive={setActive} active={active} item="Profile">
                  <div className="flex flex-col space-y-4 text-sm">
                    <ProductItem
                      title={authStatus?.user.name || ""}
                      description={authStatus?.user.email || ""}
                      src={authStatus?.user.image || "/blank_profile_pic.png"}
                    ></ProductItem>
                    <HoveredLink href="/profile/view">View Profile</HoveredLink>
                    <Button onClick={() => signOut()} variant={"destructive"}>
                      Sign Out
                    </Button>
                  </div>
                </MenuItem>
              </Menu>
              <div className="flex flex-col items-center justify-center min-w-[100px]">
                {userStatus ? (
                  <p className="text-center">Organization</p>
                ) : (
                  <p className="text-center">Volunteer</p>
                )}
                <SwitchToolTipWrapper
                  checked={userStatus}
                  setChecked={changeUserStatus}
                  specialKey={"switch2"}
                  userHasOrganization={userHasOrganization}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex xl:hidden">
              <Sheet onOpenChange={handleBurgerToggle}>
                <SheetTrigger>
                  <div className="flex flex-col justify-between w-6 h-4 cursor-pointer">
                    <div
                      className={`w-full h-0.5 bg-gray-700 transition-transform transform origin-center ${
                        isOpen
                          ? "rotate-45 translate-y-[7px]"
                          : "rotate-0 translate-y-0"
                      }`}
                    ></div>
                    <div
                      className={`w-full h-0.5 bg-gray-700 transition-opacity ${
                        isOpen ? "opacity-0" : "opacity-100"
                      }`}
                    ></div>
                    <div
                      className={`w-full h-0.5 bg-gray-700 transition-transform transform origin-center ${
                        isOpen
                          ? "-rotate-45 -translate-y-[7px]"
                          : "rotate-0 translate-y-0"
                      }`}
                    ></div>
                  </div>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[90%] md:w-1/2 overflow-y-scroll hidden-scrollbar"
                >
                  <SheetHeader>
                    <SheetTitle>
                      <SheetClose asChild>
                        <Link href={"/"}>
                          <div className="flex flex-col justify-center items-center">
                            <img
                              src="/Favicon.png"
                              alt="Volunteer Opportunities Logo"
                              className="w-[50px] h-[50px]"
                            />
                            <h1>Volunteer Opportunities</h1>
                          </div>
                        </Link>
                      </SheetClose>
                    </SheetTitle>
                    <SheetDescription>
                      <div className="flex justify-start flex-col gap-5">
                        <div className="flex justify-start flex-col gap-5">
                          <div className="flex flex-col gap-2">
                            <h1 className="font-medium text-xl text-black">
                              Explore
                            </h1>
                            <div className="ml-5 flex flex-col gap-3">
                              <SheetClose asChild>
                                <Link href={"/explore"} className="block">
                                  Search for listings that suit you
                                </Link>
                              </SheetClose>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <h1 className="font-medium text-xl text-black">
                              Login/Register
                            </h1>
                            <div className="ml-5 flex flex-col gap-3">
                              <SheetClose asChild>
                                <Link href={"/login"} className="block">
                                  Sign In
                                </Link>
                              </SheetClose>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
            <div className={cn("hidden xl:block relative z-500", className)}>
              <Menu setActive={setActive}>
                <HoveredLink href="/explore">
                  <MenuItem
                    setActive={setActive}
                    active={active}
                    item="Explore"
                  >
                    <div className="flex flex-col space-y-4 text-sm">
                      Search for listings that suit you
                    </div>
                  </MenuItem>
                </HoveredLink>
                <HoveredLink href="/login">
                  <MenuItem
                    setActive={setActive}
                    active={active}
                    item="Login/Register"
                  >
                    <div className="flex flex-col space-y-4 text-sm">
                      Sign In
                    </div>
                  </MenuItem>
                </HoveredLink>
              </Menu>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
