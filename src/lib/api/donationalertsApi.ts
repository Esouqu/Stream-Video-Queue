import type { IDonationAlertsUserData } from "../interfaces";

class DonationAlertsApi {
  public async getUser() {
    const response = await fetch('/api/donationalerts/user')
      .then((res) => res)

    if (response.status === 200) {
      return await response.json().then((data: IDonationAlertsUserData) => data);
    }
  }
}

const donationAlertsApi = new DonationAlertsApi();

export default donationAlertsApi;
