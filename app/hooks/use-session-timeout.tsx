import { useNavigation, useSubmit } from "@remix-run/react";
import React from "react";
import { prisma } from "~/db.server";

export function useSessionTimeout() {
  const submit = useSubmit();
  const navigation = useNavigation();

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      submit(null, { method: "POST", action: "/logout" });
    }, 18000000);
    return () => clearTimeout(timeout);
  }, [submit, navigation]);
}

// export async function useOrderDelete(orderId: string) {
//   const submit = useSubmit()
//   const navigation = useNavigation()
//   const order = await prisma.order.findFirst({
//     where: {id: orderId, paid: true},
//   })
//   console.log('order', order)

//   // React.useEffect(() => {
//   //   const timeout = setTimeout(() => {
//   //     submit(null, {method: 'POST', action: '/logout'})
//   //   }, 18000000)
//   //   return () => clearTimeout(timeout)
//   // }, [submit, navigation])
// }
