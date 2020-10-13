import React from "react"
import { graphql, StaticQuery } from "gatsby"
import Img from "gatsby-image"
import styles from "./indexHeader.module.scss"
import Button from "../common/button"

export default function IndexHeader({
  candidatesPageLink,
  referendumsPageLink,
}) {
  return (
    <StaticQuery
      query={graphql`
        query {
          headerImage: imageSharp(
            fluid: { originalName: { eq: "headerBlob.png" } }
          ) {
            fluid(maxWidth: 725, quality: 60) {
              ...GatsbyImageSharpFluid
              ...GatsbyImageSharpFluidLimitPresentationSize
            }
          }
        }
      `}
      render={data => {
        console.log(data)
        return (
          <header className={styles.heroOuterContainer}>
            <div className={styles.heroInnerContainer}>
              <div className={styles.heroLeft}>
                <h1>
                  More money,
                  <br />
                  more transparency.
                </h1>
                <h2>
                  Keep tabs on the influence of money
                  <br />
                  in local San José elections.
                </h2>
                <div className={styles.heroButtonContainer}>
                  <div className={styles.primaryCTA}>
                    <Button
                      text="Explore candidates"
                      href={candidatesPageLink}
                    />
                  </div>
                  <Button
                    secondary
                    text="View measures"
                    href={referendumsPageLink}
                  />
                </div>
              </div>
              <div className={styles.heroRight}>
                <Img
                  alt="A man and a women walking into San José City Hall"
                  loading="eager"
                  fluid={data.headerImage.fluid}
                />
              </div>
            </div>
          </header>
        )
      }}
    />
  )
}
