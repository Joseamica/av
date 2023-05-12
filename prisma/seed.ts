// const { PrismaClient } = require("@prisma/client");
import {PrismaClient} from '@prisma/client'
const db = new PrismaClient()

async function seed() {
  const user = await db.user.create({
    data: {
      name: 'hola',
      email: 'kiliman@gmail',
      total: 0,
    },
  })

  const restaurant = await db.restaurant.create({
    data: {
      name: 'Guavos',
      logo: 'https://madre-cafe.com/wp-content/uploads/2021/11/logo-madre-cafe-header.svg',
      email: 'info@madrecafe.com',
      phone: '+525561412847',
      adminEmail: 'joseamica@gmail.com',
    },
  })

  const branch = await db.branch.create({
    data: {
      name: 'La Bikina',
      ppt_image:
        'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/bikina%2Fven-a-disfrutar-de-nuestra.jpeg?alt=media&token=12440861-bdd0-435f-8ad7-0c29c8103f1e',
      email: 'branch1@madrecafe.com',
      phone: '8885551212',
      wifi: '1A2B3C4D5e%6789',

      city: 'Cuernavaca',
      address:
        'Mexico-Acapulco KM. 87.5, Villas del Lago, 62370 Cuernavaca, Mor.',
      extraAddress: 'Averanda',
      rating: 4.8,
      rating_quantity: 400,
      cuisine: 'Mexicana',
      open: 7,
      close: 24,
      restaurant: {connect: {id: restaurant.id}},
    },
  })

  const NUMBER_OF_TABLES = 4
  for (let i = 1; i <= NUMBER_OF_TABLES; i++) {
    const table = await db.table.create({
      data: {
        table_number: i,
        order_in_progress: false,
        branch: {connect: {id: branch.id}},
        employees: {
          create: {
            name: 'Victor',
            rol: 'waitress',
            email: 'bnlabla@gmaillcom',
            image:
              'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=778&q=80',
          },
        },
      },
    })
  }

  const tableId = await db.table.findFirst({where: {table_number: 1}})

  const manager = await db.employee.create({
    data: {
      rol: 'manager',
      name: 'Daniel',
      email: 'gerente',
      image:
        'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      tables: {connect: {id: tableId?.id}},
    },
  })
  // const waitress = await db.employee.create({
  //   data:{
  //     rol: "waitress",
  //     name:"Enrique",
  //     table: { connect: { id: table.id } }
  //   }
  // })

  const menu = await db.menu.create({
    data: {
      name: 'DESAYUNO',
      type: 'breakfast',
      branchId: branch.id,
      image:
        'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/bikina%2Fven-a-disfrutar-de-nuestra.jpeg?alt=media&token=12440861-bdd0-435f-8ad7-0c29c8103f1e',
      allday: true,
      currency: 'euro',
    },
  })

  const bikinaMenuCategories = await Promise.all(
    getBikinaCategories().map(({name}) =>
      db.menuCategory.create({
        data: {
          name,
          menu: {connect: {id: menu.id}},
        },
      }),
    ),
  )

  // await db.showingHours.create({
  //   data: {
  //     fromHour: 0,
  //     toHour: 24,
  //     allDay: false,
  //     menus: { connect: { id: menu.id } },
  //   },
  // })

  // const categories = await Promise.all(
  //   getCategories().map(({ name }) =>
  //     db.menuCategory.create({
  //       data: {
  //         name,
  //         menu: { connect: { id: menu.id } },
  //       },
  //     })
  //   )
  // );

  const menuItems = await Promise.all(
    bikinaMenuCategories.flatMap((category, i) =>
      range(1, 1).map(j =>
        db.menuItem.create({
          data: {
            name: `${category.name} Item #${j}`,
            image:
              'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/Id_001.png?alt=media&token=884c7d94-0f8e-40c2-800d-ea62b888b1d9',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            price: getRandom(100, 520),
            available: true,
            menuCategory: {connect: {id: category.id}},
          },
        }),
      ),
    ),
  )
}

seed()

function getBikinaCategories() {
  return [
    {
      id: 1,
      name: 'Entradas',
    },
    {
      id: 2,
      name: 'Sopas',
    },
    {
      id: 3,
      name: 'Ensaladas',
    },
    {
      id: 4,
      name: 'Platillos',
    },
    {
      id: 5,
      name: 'Tacos',
    },
    {
      id: 6,
      name: 'Quesos Fundidos',
    },
    {
      id: 7,
      name: 'Pastas',
    },
    {
      id: 8,
      name: 'Grill',
    },
    {
      id: 9,
      name: 'Guarniciones',
    },
    {
      id: 10,
      name: 'Pescados & Mariscos',
    },
    {
      id: 11,
      name: 'Extras',
    },
    {
      id: 12,
      name: 'Postres',
    },
  ]
}

function getCategories() {
  return [
    {
      id: 1,
      name: 'Hot Cakes',
    },
    {
      id: 2,
      name: 'Frutas',
    },
    {
      id: 3,
      name: 'Pan Francés',
    },
    {
      id: 4,
      name: 'Huevos',
    },
    {
      id: 5,
      name: 'Molletes',
    },
    {
      id: 6,
      name: 'Chilaquiles',
    },
    {
      id: 7,
      name: 'Toasts',
    },
    {
      id: 8,
      name: 'Especiales',
    },
    {
      id: 9,
      name: 'Jugos',
    },
  ]
}

function getDishes() {
  return [
    {
      image: 'https://drive.google.com/uc?id=16Bju_Lz6Opkw0EtDLAkVXbqRQit0zi5a',
      name: 'Hot Cakes de Nutella',
      meal: 'desayuno',
      description: 'Rellenos de nutella con compota de plátano.',
      specs: ['vegano'],
      price: 180,
      menu: {
        connect: {
          id: 1,
        },
      },
    },
    {
      image: 'https://drive.google.com/uc?id=1M5GRr1yoHzRHjCEPNNQevpIdRx9vuRp8',
      name: 'Hot Cakes de Frutos Rojos',
      meal: 'desayuno',
      description: 'Con salsa de frutos rojos con mantequilla mascarpone.',
      specs: ['vegano'],
      price: 120,
      menu: {
        connect: {
          id: 1,
        },
      },
    },
    {
      image: 'https://drive.google.com/uc?id=1OXNDPb07iM56ECe9KUNnihcMRLQUfYmx',
      name: 'Huevos Rotos',
      meal: 'desayuno',
      description:
        'Huevos rotos con jamón serrano, papas confitadas y pimientos rojos',
      specs: ['vegano'],
      price: 178,
      menu: {
        connect: {
          id: 1,
        },
      },
    },
    {
      image: 'https://drive.google.com/uc?id=1DOBu7FBErMHJuqujOGah9xqXSQF5rr0X',
      name: 'Toast de Aguacate',
      meal: 'desayuno',
      description:
        'Pan campesino con guacamole hecho en casa, rabano, jitomate cherry y huevo pochado.',
      specs: ['vegano'],
      price: 185,
      menu: {
        connect: {
          id: 1,
        },
      },
    },
    {
      image: 'https://drive.google.com/uc?id=1dPdRyMJ_HiR6x57dxahiG9nbh3OFNpxP',
      name: 'Omelette de Chilaquiles',
      meal: 'desayuno',
      description:
        'Omellete relleno de chilaquiles bañado en salsa verde o roja con crema y queso.',
      specs: ['vegano'],
      price: 180,
      menu: {
        connect: {
          id: 1,
        },
      },
    },
    {
      image: 'https://drive.google.com/uc?id=1T6OuCY8pqppnSRjlQfAeoNGJwfepR1XU',
      name: 'Chilaquiles',
      meal: 'desayuno',
      description: 'Verdes o rojos con pollo / huevo.',
      specs: ['vegano'],
      price: 198,
      menu: {
        connect: {
          id: 1,
        },
      },
    },
  ]
}

function BikinaDishes() {
  return [
    {
      image:
        'https://www.queremoscomer.rest/img/editorial/recetas/MAYO2012/Azul_Condesa_11_2.jpg',
      name: 'Panuchos de cochinita pibil (3pzas)',
      description: 'Rellenos de nutella con compota de plátano.',
      price: 140,
      menuCatergory: {
        connect: {
          id: 1,
        },
      },
    },
  ]
}

function range(start: number, end: number, step = 1) {
  return Array.from(
    {length: (end - start + 1) / step},
    (_, i) => start + i * step,
  )
}

function getRandom(start: number, end: number) {
  return Math.floor(Math.random() * (end - start)) + start
}
