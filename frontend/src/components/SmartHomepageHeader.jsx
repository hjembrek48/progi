import { Logged_homepage_header } from "./Logged_homepage_header";
import { Homepage_header } from "./Homepage_header";
import { useAuth } from "./AuthProvider";

function SmartHomepageHeader() {
  const { registrationStep, setRegistrationStep } = useAuth();
  return (
    <div>
      {registrationStep > 2 ? <Logged_homepage_header /> : <Homepage_header />}
    </div>
  );
}

export default SmartHomepageHeader;
