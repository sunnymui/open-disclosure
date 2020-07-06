import React from 'react'
import styles from './behindTheScenesItem.module.scss'
import Button from '../common/button'

const BehindTheScenesItem = item => (
  <div className={styles.container}>
    <img alt="behind the scenes" height='315px' src={item.image} />
    <h3>{item.title}</h3>
    <p>{item.description1}</p>
    <p>{item.description2}</p>
    <div className={styles.footer}>
      <Button text={item.buttonText} />
    </div>
  </div>
)

export default BehindTheScenesItem
