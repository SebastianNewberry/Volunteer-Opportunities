import UserPage from "./components/user";
import React from "react";
import {
  userData,
  getSkills,
  userSkills,
  getOrganizations,
  getListings,
} from "./actions";

import { getImage } from "@/database/sthree";

type organizationId = {
  orgID: string;
};
// Add to change image from type unknown to any to access storageId.
// Can be removed if organizations arry is changed to type any
// Do not want to do this while working on page because it removes
// type saftey.
type org =
  | [
      (
        | {
            id: string;
            name: string;
            image: any;
          }[]
        | null
      ),
      null,
    ]
  | [
      null,
      (
        | {
            code: number;
            message: string;
          }
        | {
            code: string;
            message: string;
          }
      ),
    ];

export default async function EditProfile() {
  const skills = await getSkills();
  const userD: any = await userData();
  const userSkill = await userSkills();

  const organizations: org = await getOrganizations();

  if (
    skills != null &&
    userD != null &&
    userSkill != null &&
    organizations != null
  ) {
    if (userD.customFile) {
      userD.userImage = await getImage(userD.userImage);
    }
    const picture = userD[0]![0].image || "";
    // Added type any to allow access tp the inside of json data
    const listings: any = [];
    for (let i = 0; i < organizations[0]!.length; i++) {
      let id: organizationId = { orgID: organizations[0]![i].id };
      listings[i] = await getListings(id);
      for (let j = 0; i < listings[i]!.length; j++) {
        listings[i]![j]!.thumbnail = await getImage(listings[i]![j]!.thumbnail);
      }
      // Replace the image key with a signed url to the image
      organizations[0]![i].image.storageId = await getImage(
        organizations[0]![i].image.storageId
      );
    }
    return (
      <div>
        <header></header>
        <p></p>
        <UserPage
          name={userD[0]![0].name}
          picture={picture}
          bio={userD[0]![0].bio}
          skills={skills[0]!}
          userS={userSkill[0]!}
          organizations={organizations[0]!}
          listings={listings}
        ></UserPage>
      </div>
    );
  } else {
    return <div></div>;
  }
}
