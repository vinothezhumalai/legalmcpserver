import { LegalDocument } from './types.js';

export const SAMPLE_LEGAL_SCENARIOS: LegalDocument[] = [
  {
    title: "Smith v. Jones Construction Co.",
    caseNumber: "2023-CV-1234",
    jurisdiction: "Superior Court of California",
    date: "2023-06-15",
    content: `FACTS: Smith hired Jones Construction Co. to build a custom home for $500,000 with completion by December 1, 2022. The contract included specific materials (hardwood floors, granite countertops) and a liquidated damages clause of $200 per day for late completion. Jones began work in August 2022 but encountered supply chain delays and completed the home on February 15, 2023, 76 days late. Additionally, Jones substituted laminate flooring instead of hardwood and used marble countertops instead of granite, citing cost savings. Smith refused final payment of $50,000 and sued for breach of contract, seeking damages for delay ($15,200) and cost to remedy material substitutions ($25,000). Jones counterclaimed for the final payment, arguing delays were due to unforeseeable supply chain issues and material substitutions were reasonable commercial equivalents.

HOLDING: The court ruled in favor of Smith, finding material breach of contract. Jones Construction Co. is liable for liquidated damages and cost of remedial work, totaling $40,200. Smith must pay the remaining contract balance minus awarded damages.`
  },
  {
    title: "People v. Rodriguez Tax Evasion Case",
    caseNumber: "2023-CR-5678",
    jurisdiction: "Federal District Court, Southern District of New York",
    date: "2023-09-20",
    content: `FACTS: Maria Rodriguez, a small business owner, operated three restaurants from 2018-2021. IRS investigation revealed Rodriguez maintained two sets of books, underreporting cash transactions by approximately $750,000 over three years. She failed to report tips paid to employees, claimed personal expenses as business deductions (including family vacation costs of $35,000), and structured cash deposits to avoid Bank Secrecy Act reporting requirements. Rodriguez owed $180,000 in unpaid taxes plus penalties and interest totaling $95,000. During investigation, Rodriguez attempted to pay outstanding taxes but prosecutors had already filed criminal charges for tax evasion under 26 U.S.C. § 7201.

HOLDING: Rodriguez pleaded guilty to willful tax evasion. The court sentenced her to 18 months imprisonment, two years supervised release, and ordered restitution of $275,000 to the IRS. The court noted her cooperation and partial restitution efforts in determining the sentence within federal guidelines.`
  },
  {
    title: "American Civil Liberties Union v. State of Texas",
    caseNumber: "2023-CV-3456",
    jurisdiction: "U.S. District Court, Western District of Texas",
    date: "2023-08-10",
    content: `FACTS: Texas enacted House Bill 1492, requiring social media platforms to verify user ages and obtain parental consent for users under 18. The law imposed criminal penalties on platforms failing to comply and created a private right of action for parents against platforms that allow minors to access content deemed harmful. ACLU challenged the law on First Amendment grounds, arguing it constitutes prior restraint on speech, is unconstitutionally vague, and violates the Commerce Clause by regulating interstate commerce. The state defended the law as protecting minors from harmful online content and argued it falls within police powers to protect children.

ISSUE: Whether Texas HB 1492 violates the First Amendment's free speech protections and the Commerce Clause of the U.S. Constitution.

HOLDING: The court granted preliminary injunction against enforcement of HB 1492. The law likely violates the First Amendment as content-based regulation subject to strict scrutiny, which the state cannot meet. The age verification requirements impose substantial burden on protected speech and the definition of 'harmful content' is unconstitutionally vague.`
  },
  {
    title: "Greenfield Development LLC v. City of Riverside",
    caseNumber: "2023-CV-7890",
    jurisdiction: "California Court of Appeal, Fourth District",
    date: "2023-11-05",
    content: `FACTS: Greenfield Development purchased 45 acres of agricultural land in 2020 for $2.3 million, intending to develop residential housing. The property was zoned agricultural but Greenfield expected to obtain rezoning based on city's general plan showing the area designated for future residential development. In 2022, the city council voted 4-3 to deny Greenfield's rezoning application due to environmental concerns and community opposition. Greenfield claims this denial constituted a regulatory taking under the Fifth Amendment, arguing the denial destroyed all economically viable use of the property. The city argues no taking occurred because agricultural use remained viable and Greenfield's development expectations were speculative.

ISSUE: Whether the city's denial of rezoning application constitutes a compensable regulatory taking under the Fifth Amendment.

HOLDING: The court ruled no regulatory taking occurred. Under Lucas v. South Carolina Coastal Council, a regulatory taking requires denial of all economically beneficial use. Here, agricultural use remained viable, and Greenfield's development expectations did not create a reasonable investment-backed expectation for rezoning approval.`
  },
  {
    title: "Thompson v. MegaMart Stores Inc.",
    caseNumber: "2023-CV-2468",
    jurisdiction: "Circuit Court of Cook County, Illinois",
    date: "2023-07-22",
    content: `FACTS: Jennifer Thompson, 34, slipped and fell in the produce section of MegaMart on November 15, 2022. Security footage showed an employee had mopped the area 20 minutes before Thompson's fall but failed to place warning signs or barriers. The floor appeared dry but had a thin layer of cleaning solution residue. Thompson suffered herniated discs requiring surgery, with medical expenses of $75,000 and six months of lost work wages totaling $32,000. MegaMart argues Thompson was distracted by her phone and failed to watch where she was walking, claiming comparative negligence. Thompson's medical expert testified her injuries were consistent with slip-and-fall mechanism.

ISSUE: Whether MegaMart breached its duty of care to maintain safe premises and whether Thompson's contributory negligence bars or reduces recovery.

HOLDING: Jury found MegaMart 70% liable for failing to properly warn of slippery conditions and Thompson 30% liable for inattentive walking. Under Illinois comparative negligence law, Thompson recovers 70% of $107,000 in damages, totaling $74,900.`
  },
  {
    title: "SEC v. CryptoFuture Technologies Inc.",
    caseNumber: "2023-CV-8765",
    jurisdiction: "U.S. District Court, Southern District of New York",
    date: "2023-10-12",
    content: `FACTS: CryptoFuture Technologies raised $50 million through sale of 'FutureCoin' tokens from 2021-2022, marketing them as utility tokens for accessing blockchain platform services. SEC investigation revealed CryptoFuture used 80% of proceeds for general corporate expenses rather than platform development, made false statements about partnerships with major tech companies, and promised token holders profit sharing that constituted investment contract features. CEO Michael Chen personally received $8 million in proceeds. The platform was never operational, and most tokens became worthless when the company ceased operations in late 2022.

ISSUE: Whether FutureCoins constitute unregistered securities under federal securities laws and whether defendants committed securities fraud.

HOLDING: The court found FutureCoins were securities under the Howey test: investment of money in common enterprise with expectation of profits derived from efforts of others. CryptoFuture and Chen violated Securities Act registration requirements and committed fraud through material misstatements. Court ordered disgorgement of $50 million plus prejudgment interest and imposed civil penalties of $15 million.`
  },
  {
    title: "State v. Williams Armed Robbery",
    caseNumber: "2023-CR-9876",
    jurisdiction: "Superior Court of Fulton County, Georgia",
    date: "2023-05-30",
    content: `FACTS: On March 10, 2023, Marcus Williams, 28, entered First National Bank wearing a mask and dark clothing. He approached teller Sarah Johnson, displayed what appeared to be a handgun, and demanded cash. Johnson complied, providing $12,500 from her drawer. Williams fled on foot but was apprehended six blocks away after witnesses identified him and police tracked his cell phone location. At arrest, police found $12,400 cash and a realistic toy gun in his backpack. Williams confessed to the robbery but claimed financial desperation due to medical bills for his sick daughter. He has prior convictions for theft (2018) and drug possession (2020).

ISSUE: Appropriate sentence considering armed robbery conviction, use of simulated weapon, and defendant's personal circumstances.

HOLDING: Williams pleaded guilty to armed robbery. Despite the toy weapon, Georgia law treats simulated firearms as deadly weapons during robbery. The court sentenced Williams to 12 years imprisonment with possibility of parole after 7 years, considering his cooperation, family circumstances, and genuine remorse while recognizing the serious nature of armed robbery and its impact on victims.`
  },
  {
    title: "Global Manufacturing Corp. v. Environmental Protection Agency",
    caseNumber: "2023-CV-5432",
    jurisdiction: "U.S. Court of Appeals, District of Columbia Circuit",
    date: "2023-12-01",
    content: `FACTS: EPA issued new regulations under the Clean Air Act requiring manufacturing facilities to reduce nitrogen oxide emissions by 75% within five years. Global Manufacturing operates 12 facilities nationwide and estimated compliance costs at $240 million, arguing the regulations would force closure of three facilities and eliminate 800 jobs. The company challenged the regulations as arbitrary and capricious under the Administrative Procedure Act, claiming EPA failed to conduct adequate cost-benefit analysis and didn't consider less burdensome alternatives. EPA defended the regulations as necessary to meet national ambient air quality standards and argued the agency provided extensive scientific justification and considered economic impacts.

ISSUE: Whether EPA's nitrogen oxide regulations are arbitrary and capricious under the Administrative Procedure Act.

HOLDING: The court upheld EPA's regulations. Under Chevron deference, EPA's interpretation of Clean Air Act requirements was reasonable. The agency provided substantial scientific evidence supporting emission reduction necessity and adequately considered economic impacts. While costs are significant, they don't outweigh public health benefits, and EPA reasonably determined less restrictive measures would be insufficient to meet statutory requirements.`
  }
];

export const LEGAL_AREA_EXAMPLES = {
  'Contract Law': [0],
  'Tax Law': [1], 
  'Constitutional Law': [2],
  'Property Law': [3],
  'Tort Law': [4],
  'Securities Law': [5],
  'Criminal Law': [6],
  'Administrative Law': [7]
};