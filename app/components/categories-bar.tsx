import type {MenuCategory} from '@prisma/client'
import {Link} from '@remix-run/react'
import clsx from 'clsx'
import {motion} from 'framer-motion'
import React from 'react'

type Props = {
  categories: MenuCategory[]
  isSticky?: boolean
  [key: string]: any
  categoryId?: string
}

export function CategoriesBar({
  categories,
  isSticky,
  categoryId,
}: Props): JSX.Element {
  const categoryRefs = React.useRef<Record<string, HTMLAnchorElement>>({})
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (
      categoryId &&
      categoryRefs.current[categoryId] &&
      containerRef.current
    ) {
      const categoryElement = categoryRefs.current[categoryId]
      const scrollPos = categoryElement.offsetLeft // Scroll al inicio del elemento seleccionado

      // Aquí es donde se realiza la animación de desplazamiento
      containerRef.current.scrollTo({
        left: scrollPos - 8,
        behavior: 'smooth',
      })
    }
  }, [categoryId])

  return (
    <motion.div
      ref={containerRef}
      className={clsx(
        'no-scrollbar dark:bg-night-bg_principal flex items-center space-x-2 overflow-x-scroll whitespace-nowrap rounded-xl bg-day-bg_principal px-5 py-4 shadow-lg',
        {
          'dark:text-night-text_principal sticky top-14  bg-day-bg_principal':
            isSticky,
        },
      )}
    >
      {categories.map((category: MenuCategory) => (
        <Link
          ref={el => (categoryRefs.current[category.id] = el!)}
          to={`#${category.id}`}
          {...{preventScrollReset: true}}
          key={category.id}
          className={clsx({
            'rounded-full bg-day-principal px-3 text-lg font-medium text-white  underline-offset-4':
              category.id === categoryId, // Aplica el estilo si la categoría es la actual
          })}
        >
          {category.name}
        </Link>
      ))}
    </motion.div>
  )
}
