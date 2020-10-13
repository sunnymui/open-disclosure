import React from "react"
import Img from "gatsby-image"
import Button from "../common/button"
import styles from "./behindTheScenesItem.module.scss"

const BehindTheScenesItem = item => (
  <div className={styles.container} key={item.title}>
    {console.log(item.image)}
    <Img
      alt="A person standing next to an icon representing the section"
      loading="lazy"
      fluid={item.image.childImageSharp.fluid}
    />
    <h3>{item.title}</h3>
    <p className={styles.description}>{item.description}</p>
    <div className={styles.footer}>
      <Button secondary responsive text={item.buttonText} href={item.href} />
    </div>
  </div>
)

export default BehindTheScenesItem
