const { expect } = require('chai')
const { ethers } = require('hardhat')
const { loadFixture } = require('@nomicfoundation/hardhat-toolbox/network-helpers')

describe('Voting', function () {
  async function deployFixture() {
    const [owner, alice, bob, carol] = await ethers.getSigners()
    const Voting = await ethers.getContractFactory('Voting')
    const voting = await Voting.deploy()
    await voting.waitForDeployment()
    return { voting, owner, alice, bob, carol }
  }

  describe('deployment', function () {
    it('sets the deployer as owner', async function () {
      const { voting, owner } = await loadFixture(deployFixture)
      expect(await voting.owner()).to.equal(owner.address)
    })

    it('starts with no candidates', async function () {
      const { voting } = await loadFixture(deployFixture)
      expect(await voting.candidateCount()).to.equal(0)
    })
  })

  describe('addCandidate', function () {
    it('lets the owner add a candidate and emits CandidateAdded', async function () {
      const { voting } = await loadFixture(deployFixture)
      await expect(voting.addCandidate('Alice'))
        .to.emit(voting, 'CandidateAdded')
        .withArgs(0, 'Alice')
      expect(await voting.candidateCount()).to.equal(1)
    })

    it('reverts when a non-owner adds a candidate', async function () {
      const { voting, alice } = await loadFixture(deployFixture)
      await expect(
        voting.connect(alice).addCandidate('Mallory')
      ).to.be.revertedWithCustomError(voting, 'NotOwner')
    })
  })

  describe('vote', function () {
    it('increments the candidate vote count and emits Voted', async function () {
      const { voting, alice } = await loadFixture(deployFixture)
      await voting.addCandidate('Alice')
      await expect(voting.connect(alice).vote(0))
        .to.emit(voting, 'Voted')
        .withArgs(alice.address, 0)
      const candidates = await voting.getCandidates()
      expect(candidates[0].voteCount).to.equal(1)
      expect(await voting.hasVoted(alice.address)).to.equal(true)
    })

    it('reverts on a second vote from the same address', async function () {
      const { voting, alice } = await loadFixture(deployFixture)
      await voting.addCandidate('Alice')
      await voting.connect(alice).vote(0)
      await expect(
        voting.connect(alice).vote(0)
      ).to.be.revertedWithCustomError(voting, 'AlreadyVoted')
    })

    it('reverts on an invalid candidate index', async function () {
      const { voting, alice } = await loadFixture(deployFixture)
      await voting.addCandidate('Alice')
      await expect(
        voting.connect(alice).vote(5)
      ).to.be.revertedWithCustomError(voting, 'InvalidCandidate')
    })
  })

  describe('getCandidates', function () {
    it('returns every candidate with its vote count', async function () {
      const { voting, alice, bob } = await loadFixture(deployFixture)
      await voting.addCandidate('Alice')
      await voting.addCandidate('Bob')
      await voting.connect(alice).vote(1)
      await voting.connect(bob).vote(1)

      const candidates = await voting.getCandidates()
      expect(candidates.length).to.equal(2)
      expect(candidates[0].name).to.equal('Alice')
      expect(candidates[0].voteCount).to.equal(0)
      expect(candidates[1].name).to.equal('Bob')
      expect(candidates[1].voteCount).to.equal(2)
    })
  })

  describe('getWinner', function () {
    it('reverts when there are no candidates', async function () {
      const { voting } = await loadFixture(deployFixture)
      await expect(voting.getWinner()).to.be.revertedWithCustomError(
        voting,
        'NoCandidates'
      )
    })

    it('returns the candidate with the most votes', async function () {
      const { voting, alice, bob, carol } = await loadFixture(deployFixture)
      await voting.addCandidate('Alice')
      await voting.addCandidate('Bob')
      await voting.connect(alice).vote(1)
      await voting.connect(bob).vote(1)
      await voting.connect(carol).vote(0)
      expect(await voting.getWinner()).to.equal('Bob')
    })

    it('returns the first-added leader on a tie', async function () {
      const { voting, alice, bob } = await loadFixture(deployFixture)
      await voting.addCandidate('Alice')
      await voting.addCandidate('Bob')
      await voting.connect(alice).vote(0)
      await voting.connect(bob).vote(1)
      // both have 1 vote -> first-added (Alice) wins
      expect(await voting.getWinner()).to.equal('Alice')
    })
  })
})
