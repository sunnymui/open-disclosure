const path = require(`path`)

const fetch = require("node-fetch")

// TODO Add dev/prod variations
const HOSTNAME = process.env.GATSBY_API_HOST || "localhost:5000"
const CANDIDATE_NODE_TYPE = `Candidate`
const ELECTION_NODE_TYPE = `Election`
const METADATA_NODE_TYPE = `Metadata`
const OFFICE_ELECTION_NODE_TYPE = `OfficeElection`
const REFERENDUM_NODE_TYPE = `Referendum`

const DUMMY_DATA = {
  candidates: {
    Candidates: [
      {
        ID: "councilmember-district-6;dev-davis;11-3-2020",
        Name: "Dev Davis",
        Committees: [
          {
            ID: "john-pisacane-&-teresa-newell;11-3-2020",
            Name: "John Pisacane & Teresa Newell",
            TotalFunding: 500.0,
          },
          {
            ID: "mina-acharya;11-3-2020",
            Name: "Mina Acharya",
            TotalFunding: 600.0,
          },
          {
            ID: "sanjeev-acharya;11-3-2020",
            Name: "Sanjeev Acharya",
            TotalFunding: 600.0,
          },
        ],
      },
      {
        ID: 'councilmember-district-6;jacob-"jake"-tonkel;11-3-2020',
        Name: 'Jacob "Jake" Tonkel',
        Committees: [
          {
            ID: "gary-abreim;11-3-2020",
            Name: "Gary Abreim",
            TotalFunding: 25.0,
          },
          {
            ID: "blake-adams;11-3-2020",
            Name: "Blake Adams",
            TotalFunding: 125.0,
          },
          {
            ID: "vicki-adams;11-3-2020",
            Name: "Vicki Adams",
            TotalFunding: 31.46,
          },
        ],
      },
    ],
  },
  elections: {
    Elections: {
      "11/3/2020": {
        Title: "2020 Election Cycle",
        Date: "2020-11-03",
        TotalContributions: 1000,
        OfficeElections: [
          {
            Title: "Councilmember District 6",
            CandidateIDs: [
              "councilmember-district-6;dev-davis;11-3-2020",
              'councilmember-district-6;jacob-"jake"-tonkel;11-3-2020',
            ],
            TotalContributions: 300,
          },
        ],
        Referendums: [
          {
            Title: "Ballot Measure C",
            Description: "This ballot measure will allow people to have fun",
            TotalContributions: 700,
          },
        ],
      },
    },
  },
  metadata: {
    DateProcessed: "2020-09-07",
  },
}

async function fetchEndpoint(endpoint) {
  try {
    const response = await fetch(
      `http://${HOSTNAME}/open-disclosure/api/v1.0/${endpoint}`
    )
    if (response.ok) {
      // NOTE: If `gatsby develop` gives errors related to errors like `Cannot query field "fields" on type "OfficeElection"`, comment return DUMMY_DATA[endpoints] back in
      // return DUMMY_DATA[endpoint]
      return await response.json()
    }
  } catch (networkError) {
    console.warn(
      "Unable to reach the API server at " +
        HOSTNAME +
        ", falling back to mock data"
    )
    console.info(
      "Use the environment variable GATSBY_API_HOST to use a different hostname for the API server"
    )
  }
  return DUMMY_DATA[endpoint]
}

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode } = actions

  const [
    candidateData,
    electionData,
    referendumData,
    metadata,
  ] = await Promise.all([
    fetchEndpoint("candidates"),
    fetchEndpoint("elections"),
    fetchEndpoint("referendums"),
    fetchEndpoint("metadata"),
  ])
  candidateData.Candidates.forEach(candidate => {
    const { TotalRCPT, TotalLOAN } = candidate
    // We're currently using RCPT because all the aggregations only use RCPT.
    // TODO Include LOAN in TotalContributions
    const TotalContributions = TotalRCPT
    createNode({
      ...candidate,
      TotalContributions,
      id: createNodeId(`${CANDIDATE_NODE_TYPE}-${candidate.ID}`),
      parent: null,
      children: [],
      internal: {
        type: CANDIDATE_NODE_TYPE,
        content: JSON.stringify(candidate),
        contentDigest: createContentDigest(candidate),
      },
    })
  })
  const election = electionData.Elections["11/3/2020"]
  createNode({
    ...election,
    OfficeElections: election.OfficeElections.map(officeElection => {
      const id = createNodeId(
        `${OFFICE_ELECTION_NODE_TYPE}-${officeElection.Title}`
      )
      createNode({
        ...officeElection,
        id,
        parent: null,
        children: [],
        internal: {
          type: OFFICE_ELECTION_NODE_TYPE,
          content: JSON.stringify(officeElection),
          contentDigest: createContentDigest(officeElection),
        },
      })
      return id
    }),
    // TODO: Switch this out for real Referendum data once edge cases get fixed
    // Referendums: election.Referendums.map(referendum => {
    Referendums: election.Referendums.map(referendum => {
      const id = createNodeId(`${REFERENDUM_NODE_TYPE}-${election.Name}`)

      createNode({
        ...referendum,
        id,
        parent: null,
        children: [],
        internal: {
          type: REFERENDUM_NODE_TYPE,
          content: JSON.stringify(referendum),
          contentDigest: createContentDigest(referendum),
        },
      })
      return id
    }),
    id: createNodeId(`${ELECTION_NODE_TYPE}-${election.Date}`),
    parent: null,
    children: [],
    internal: {
      type: ELECTION_NODE_TYPE,
      content: JSON.stringify(election),
      contentDigest: createContentDigest(election),
    },
  })
  createNode({
    ...metadata,
    id: createNodeId(`${METADATA_NODE_TYPE}`),
    parent: null,
    children: [],
    internal: {
      type: METADATA_NODE_TYPE,
      content: JSON.stringify(metadata),
      contentDigest: createContentDigest(metadata),
    },
  })
  return
}
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const result = await graphql(`
    query {
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
                ID
                Name
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
              Committee {
                Name
                TotalFunding
              }
              fields {
                slug
              }
            }
          }
        }
      }
    }
  `)
  result.data.allElection.edges.forEach(({ node }) => {
    node.OfficeElections.forEach(election => {
      createPage({
        path: `/${node.Date}/candidates/${election.fields.slug}`,
        component: path.resolve("src/templates/candidates.js"),
        context: {
          slug: election.fields.slug,
        },
      })
      election.Candidates.forEach(candidate => {
        createPage({
          path: `/${node.Date}/candidate/${election.fields.slug}/${candidate.fields.slug}`,
          component: path.resolve("src/templates/candidate.js"),
          context: {
            slug: candidate.fields.slug,
            id: candidate.ID,
          },
        })
      })
    })
    node.Referendums.forEach(referendum => {
      createPage({
        path: `/${node.Date}/referendums/${referendum.fields.slug}`,
        component: path.resolve("src/templates/referendum.js"),
        context: {
          slug: referendum.fields.slug,
          id: referendum.id,
        },
      })
    })
  })
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    type NodeFields {
      slug: String
    }

    type Committee {
      Name: String
      TotalFunding: String
    }

    type GeoBreakdown {
      CA: Float
    }

    type FundingTypeBreakdown {
      IND: Float
      COM: Float
      OTH: Float
      PTY: Float
      SCC: Float
    }

    type ExpenditureTypeBreakdown {
      SAL: Float
      CMP: Float
      CNS: Float
      CVC: Float
      FIL: Float
      FND: Float
      LIT: Float
      MBR: Float
      MTG: Float
      OFC: Float
      POL: Float
      POS: Float
      PRO: Float
      PRT: Float
      RAD: Float
      RFD: Float
      TEL: Float
      TRS: Float
      WEB: Float
    }

    type Candidate implements Node {
      id: ID!
      ID: String!
      Name: String!
      Committees: [Committee]
      TotalContributions: Float 
      TotalEXPN: Float
      TotalLOAN: Float
      TotalRCPT: Float
      FundingByGeo: GeoBreakdown
      FundingByType: FundingTypeBreakdown
      ExpenditureByType: ExpenditureTypeBreakdown
      jsonNode: CandidatesJson @link(by: "id" from: "ID")
      fields: NodeFields
    }

    type CandidatesJson implements Node {
      id: ID!
      name: String!
      twitter: String
      seat: String
      ballotDesignation: String
      website: String
      votersEdge: String
      apiNode: Candidate @link(by: "ID" from: "id")
    }

    type Election implements Node {
      Title: String!
      Date: String 
      TotalContributions: Float 
      OfficeElections: [OfficeElection] @link
      Referendums: [Referendum] @link
      fields: NodeFields
    }

    type OfficeElection implements Node {
      Candidates: [Candidate] @link(by: "ID" from: "CandidateIDs")
      Title: String
      TotalContributions: Float
      fields: NodeFields
    }

    type RefElectionCycle {
      ElectionCycle: String
    }

    type RefCommittee {
      Name: String
      TotalFunding: Float
    }

    type Referendum implements Node {
      id: ID
      Name: String!
      Election: RefElectionCycle
      Committee: RefCommittee
      fields: NodeFields 
    }

    type MeasuresJson implements Node {
      electionDate: String!
      title: String!
      description: String!
      ballotLanguage: String!
    }

    type Metadata implements Node{
      DateProcessed: String!
    }
  `)
}
