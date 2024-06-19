"use client";
import React, { useEffect, useRef, useState } from "react";
import { fetchUserRole } from "@/utils/jwt";

const MainSidebar = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = fetchUserRole();
    console.log("userRole", userRole);
    setRole(userRole);
  }, []);

  const hrAdmin = [
    {
      id: 1,
      title: "Add Emloyee",
      path: "/dashboard/employee-list",
    },
    {
      id: 2,
      title: "Add Leave",
      path: "/dashboard/add-leave",
    },
    {
      id: 3,
      title: "Approve Reimbursemen",
      path: "/dashboard/reimbursement-list",
    },
    {
      id: 4,
      title: "Approve Leave",
      path: "/dashboard/leave-report",
    },
  ];

  const userMenu = [
    {
      id: 1,
      title: "Apply Leave",
      path: "#",
    },
    {
      id: 2,
      title: "Apply Reimbursement",
      path: "#",
    },
    {
      id: 3,
      title: "Leave Balance",
      path: "#",
    },
  ];

  const menuItems = role === "user" ? userMenu : hrAdmin;

  return (
    <section className="h-auto bg-white dark:bg-dark">
      <div className="flex h-screen w-full max-w-[280px] flex-col justify-between overflow-y-scroll bg-primary shadow-card">
        <div>
          <div className="px-10 pb-9 pt-10">
            <a href="/#">
              <img
                src="https://cdn.tailgrids.com/2.0/image/assets/images/logo/logo-white.svg"
                alt="logo"
              />
            </a>
          </div>

          <nav className="px-6">
            <ul>
              {menuItems.map((item, index) => {
                return (
                  <NavItem
                    key={index}
                    link={item.path}
                    icon={
                      <svg
                        width={18}
                        height={18}
                        viewBox="0 0 18 18"
                        className="fill-current"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8.53955 0.907986C8.81038 0.697338 9.18962 0.697338 9.46045 0.907986L16.2105 6.15799C16.3931 6.30008 16.5 6.51856 16.5 6.75V15C16.5 15.5967 16.2629 16.169 15.841 16.591C15.419 17.0129 14.8467 17.25 14.25 17.25H3.75C3.15326 17.25 2.58097 17.0129 2.15901 16.591C1.73705 16.169 1.5 15.5967 1.5 15V6.75C1.5 6.51856 1.60685 6.30008 1.78954 6.15799L8.53955 0.907986ZM3 7.11681V15C3 15.1989 3.07902 15.3897 3.21967 15.5303C3.36032 15.671 3.55109 15.75 3.75 15.75H14.25C14.4489 15.75 14.6397 15.671 14.7803 15.5303C14.921 15.3897 15 15.1989 15 15V7.11681L9 2.45015L3 7.11681Z"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M6 9C6 8.58579 6.33579 8.25 6.75 8.25H11.25C11.6642 8.25 12 8.58579 12 9V16.5C12 16.9142 11.6642 17.25 11.25 17.25C10.8358 17.25 10.5 16.9142 10.5 16.5V9.75H7.5V16.5C7.5 16.9142 7.16421 17.25 6.75 17.25C6.33579 17.25 6 16.9142 6 16.5V9Z"
                        />
                      </svg>
                    }
                    menu={item.title}
                  />
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="px-6 py-10">
          <div className="flex items-center rounded-lg bg-white p-4 shadow-three">
            <div className="mr-4 h-[50px] w-full max-w-[50px] rounded-full">
              <img
                src="https://cdn.tailgrids.com/2.0/image/assets/images/avatar/image-05.jpg"
                alt="profile"
                className="h-full w-full rounded-full object-cover object-center"
              />
            </div>
            <div>
              <h6 className="text-base font-medium text-body-color">{role}</h6>
              <p className="text-sm text-body-color">hello@tailgrids.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainSidebar;

const NavItem = ({ menu, link, submenu, message, icon, children }: any) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger: any = useRef(null);
  const dropdown: any = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: any) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: any) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <li className="relative">
      <a
        href={link}
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`${
          dropdownOpen ? "bg-white/10 text-white" : ""
        } relative flex items-center rounded-[5px] px-[18px] py-[10px] text-base font-medium text-gray-6 duration-200 hover:bg-white/10 hover:text-white`}
      >
        <span className="pr-[10px]">{icon}</span>
        {menu}
        {message && (
          <span className="ml-4 rounded-full bg-white px-[10px] py-1 text-xs font-semibold text-primary">
            {message}
          </span>
        )}
        {submenu && (
          <span
            className={`${
              dropdownOpen === true ? "rotate-0" : "rotate-180"
            } absolute right-10 top-1/2 -translate-y-1/2`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              className="fill-current"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.5899 13.0899C15.2645 13.4153 14.7368 13.4153 14.4114 13.0899L10.0006 8.67916L5.58991 13.0899C5.26447 13.4153 4.73683 13.4153 4.41139 13.0899C4.08596 12.7645 4.08596 12.2368 4.41139 11.9114L9.41139 6.9114C9.73683 6.58596 10.2645 6.58596 10.5899 6.9114L15.5899 11.9114C15.9153 12.2368 15.9153 12.7645 15.5899 13.0899Z"
              ></path>
            </svg>
          </span>
        )}
      </a>
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`${dropdownOpen === true ? "block" : "hidden"} `}
      >
        <ul className="py-1 pl-12 pr-10">{children}</ul>
      </div>
    </li>
  );
};

const DropdownItem = ({ link, menu }: any) => {
  return (
    <li>
      <a
        href={link}
        className="flex items-center border-r-4 border-transparent py-[10px] text-base font-medium text-body-color duration-200 hover:text-primary"
      >
        {menu}
      </a>
    </li>
  );
};

const Divider = () => {
  return <div className="my-3 h-[1px] bg-[#e7e7e7]"></div>;
};
