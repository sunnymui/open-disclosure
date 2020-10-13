// Libraries
import React from "react"
import { graphql, Link } from "gatsby"
// Components
import Layout from "../components/layout"
// import Button from "../common/button/index"
import IndexHeader from "../components/indexHeader"
import MainPageSection from "../components/mainPageSection"
import MainPagePic from "../components/mainPagePic"
import SnapshotItem from "../components/snapshotItem"
import CandidateItem from "../components/candidateItem"
import BehindTheScenesItem from "../components/behindTheScenesItem"
// Images
import tertiary from "./../../static/images/Tertiary.png"
import BlankProfile from "./../../static/images/blankProfile.png"
import learnMore from "./../../static/images/learnMore.png"
import registerToVote from "./../../static/images/registerToVote.png"
// Utilities
import useWindowIsLarge from "../common/hooks/useWindowIsLarge"

const formatDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
})

const formatTotalContributions = value => {
  let maximumSignificantDigits = 3
  if (value < 1000) {
    maximumSignificantDigits = 1
  } else if (value < 10000) {
    maximumSignificantDigits = 2
  }

  return (
    (parseInt(value) / 1000).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumSignificantDigits,
    }) + "K"
  )
}

export default function MainPage(props) {
  const windowIsLarge = useWindowIsLarge()
  const {
    allElection,
    allMetadata,
    btsBlue,
    btsOrange,
    btsGreen,
    aboutBlob,
    voteBlob,
  } = props.data
  const currentElection = allElection.edges[0].node
  const lastScrape = new Date(allMetadata.edges[0].node.DateProcessed)
  let candidatesRunning = 0
  let candidateList = []
  currentElection.OfficeElections.forEach(election => {
    candidatesRunning += election.Candidates.length
    election.Candidates.forEach(candidate => {
      if (candidate) {
        candidateList.push({
          name: candidate.Name,
          position: election.Title,
          amount: candidate.TotalFunding,
          image: candidate.jsonNode?.profilePhoto || BlankProfile,
          href: `/${currentElection.Date}/candidate/${election.fields.slug}/${candidate.fields.slug}`,
        })
      }
    })
  })
  candidateList = candidateList.sort(
    (candidate1, candidate2) => candidate2.amount - candidate1.amount
  )

  if (candidateList.length > 3) {
    candidateList = candidateList.slice(0, 3)
  }

  const candidatesPageLink = `/${currentElection.Date}/candidates/${currentElection.OfficeElections[0].fields.slug}`
  const referendumsPageLink = `/${currentElection.Date}/referendums/${currentElection.Referendums[0].fields.slug}`

  const snapshotItems = {
    title: "San José live election snapshot",
    description: `Source: ${formatDate.format(
      lastScrape
    )} City of San José Campaign Finance Report`,
    items: [
      {
        number: "XXX",
        description: "Of donations from the city of San José",
      },
      {
        number: formatTotalContributions(currentElection.TotalContributions),
        description: "Amount raised to date",
      },
      {
        number: candidatesRunning,
        description: "Candidates running",
      },
    ],
    renderItem: SnapshotItem,
  }

  const candidateItems = {
    title: "Get the facts before you vote",
    description:
      "Money makes a difference in determining who wins elections.  Find out who's backing local candidates and influencing local government.",
    items: candidateList,
    renderItem: CandidateItem,
    // eslint-disable-next-line react/display-name
    footer: () => (
      <Link to={candidatesPageLink}>
        <img alt="candidates" height="37px" width="285px" src={tertiary} />
      </Link>
    ),
  }

  const behindTheScenesItems = {
    title: "Go behind the scenes",
    description:
      "We pull data from the City of San José campaign finance reporting database to bring you accurate information about the role and source of money in politics.",
    items: [
      {
        title: "Take action on measures",
        description: "Track who opposes or supports upcoming ballot measures.",
        buttonText: "View ballot measures",
        image: btsBlue,
        href: referendumsPageLink,
      },
      {
        title: "Compare local candidates",
        description: "See who’s spending and raising the most.",
        buttonText: "Browse candidates",
        image: btsOrange,
        href: candidatesPageLink,
      },
      {
        title: "Get the finance facts",
        description: "Learn more about campaign finance data.",
        buttonText: "Visit FAQs",
        image: btsGreen,
        href: "/faq",
      },
    ],
    renderItem: BehindTheScenesItem,
  }

  const about = {
    title: "Power to the people",
    description:
      "Open Disclosure was created to empower San José voters with timely, accurate, and useful information about the role of money in local elections.",
    href: "/aboutUs",
    linkImg: learnMore,
    image: { altText: "A crowd of people", ...aboutBlob },
  }

  const vote = {
    title: "Your voice matters",
    description:
      "Register to vote or see if you're already registered in less than two minutes.",
    href: "/registerToVote",
    linkImg: registerToVote,
    image: { altText: "A ballot", ...voteBlob },
  }

  return (
    <Layout title="Home" windowIsLarge={windowIsLarge}>
      <div>
        <IndexHeader
          candidatesPageLink={candidatesPageLink}
          referendumsPageLink={referendumsPageLink}
        />
        <main>
          <MainPageSection secondary {...snapshotItems} />
          <MainPageSection
            {...candidateItems}
            offWhite
            windowIsLarge={windowIsLarge}
          />
          <MainPageSection {...behindTheScenesItems} />
          <MainPagePic {...about} />
          <MainPagePic {...vote} reversed={windowIsLarge} />
        </main>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query {
    btsBlue: file(relativePath: { eq: "bts-blue.png" }) {
      ...FileImage
    }
    btsOrange: file(relativePath: { eq: "bts-orange.png" }) {
      ...FileImage
    }
    btsGreen: file(relativePath: { eq: "bts-green.png" }) {
      ...FileImage
    }
    aboutBlob: file(relativePath: { eq: "aboutBlob.png" }) {
      ...FileImage
    }
    voteBlob: file(relativePath: { eq: "voteBlob.png" }) {
      ...FileImage
    }
    allElection {
      edges {
        node {
          Title
          Date
          TotalContributions
          OfficeElections {
            Title
            TotalContributions
            fields {
              slug
            }
            Candidates {
              Name
              jsonNode {
                profilePhoto
              }
              TotalFunding
              fields {
                slug
              }
            }
          }
          Referendums {
            id
            Name
            Election {
              ElectionCycle
            }
            fields {
              slug
            }
          }
        }
      }
    }
    allMetadata {
      edges {
        node {
          DateProcessed
        }
      }
    }
  }

  fragment FileImage on File {
    childImageSharp {
      fluid(quality: 60) {
        ...GatsbyImageSharpFluid
      }
    }
  }
`
