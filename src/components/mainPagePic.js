import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"
import styles from "./mainPagePic.module.scss"

const MainPagePic = props => {
  const {
    reversed,
    title,
    description,
    href,
    linkImg,
    image: { altText, childImageSharp },
  } = props

  return (
    <section className={styles.outerContainer}>
      <div
        className={`${styles.innerContainer} ${reversed && styles.reversed}`}
      >
        <div className={styles.blob}>
          <Img alt={altText} loading="lazy" fluid={childImageSharp.fluid} />
        </div>
        <div className={styles.content}>
          <h2>{title}</h2>
          <p>{description}</p>
          <Link to={href}>
            <img alt="link" src={linkImg} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default MainPagePic
