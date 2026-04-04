export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    componentType: "input",
    type: "email",
    placeholder: "Enter your email",
  },
  {
    name: "password",
    label: "Password",
    componentType: "input",
    type: "password",
    placeholder: "Enter your password",
  },
] as const; // <--- Add 'as const' here

export const AdminSideBar = [
  {
    name: "Dashboard",
    href: "/admin/",
  },
  {
    name: "Course",
    href: "/admin/course",
  },
  {
    name: "Blog",
    href: "/admin/blog",
  },
  {
    name: "Fees",
    href: "/admin/fees",
  },
]; // No 'as const' needed here usually, but doesn't hurt

export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "phone",
    label: "Phone Number",
    placeholder: "Enter your phone number",
    componentType: "input",
    type: "text",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
] as const; // <--- Add 'as const' here