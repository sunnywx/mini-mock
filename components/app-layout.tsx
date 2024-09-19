import {
  Flex,
  Text,
  Button,
} from "@radix-ui/themes";
import { ReactNode, useEffect, useMemo, useState } from "react";
import styles from "./styles.module.scss";
import Link from "next/link";
import cs from "classnames";
import { useRouter } from "next/router";
import { Authenticator } from "@aws-amplify/ui-react";

interface Props {
  children: ReactNode;
}

type LinkItem = {
  name: string;
  url: string;
  disabled?: boolean;
  hide?: boolean;
};

const navLinks: LinkItem[] = [];

function TopNav({ signOut, user }: { signOut: any; user: any }) {
  const router = useRouter();
  const [activeUrl, setActiveUrl] = useState("/");

  // useEffect(() => {
  //   setActiveUrl(location.pathname);
  // }, []);

  // useUpdateEffect(() => {
  //   setActiveUrl(router.pathname);
  // }, [router.pathname]);

  return (
    <>
      <Flex
        justify="between"
        align="center"
        width="100%"
        className={styles.topbar}
      >
        <Flex
          align="center"
          className={styles.brand}
          onClick={() => router.push("/", undefined, { shallow: true })}
        >
          <Text className={styles.title1}>Mini mock</Text>
        </Flex>

        <Flex align="center" className={styles.navs}>
          {navLinks.map(({ name, url, disabled, hide }) => {
            if (hide) return null;

            if (disabled) {
              return (
                <Text
                  className={styles.navItem}
                  key={name}
                  style={{ cursor: "not-allowed" }}
                >
                  {name}
                </Text>
              );
            }

            return (
              <Link
                href={url}
                key={name}
                prefetch
                shallow
                className={cs(styles.navItem, {
                  [styles.active]:
                    activeUrl === url ||
                    (url !== "/" && activeUrl.endsWith(url)),
                })}
              >
                {name}
              </Link>
            );
          })}
        </Flex>

        <div className={styles.profile}>
          <span>{user?.signInDetails?.loginId}</span>
          <Button
            variant="ghost"
            className={styles.userInfo}
            style={{ display: "flex", alignItems: "center" }}
            onClick={signOut}
          >
            {/* <Avatar
                  radius="full"
                  src={userInfo.picture}
                  fallback={userName?.[0] || ""}
                  className={styles.avatar}
                /> */}
            Logout
          </Button>
        </div>
      </Flex>
    </>
  );
}

export default function Layout({ children }: Props) {
  return (
    <Flex align="center" direction="column" className={styles.page}>
      <Authenticator>
        {({ signOut, user }) => (
          <>
            <TopNav signOut={signOut} user={user} />
            <div className={styles.cont}>
              {children}
            </div>
          </>
        )}
      </Authenticator>
    </Flex>
  );
}
