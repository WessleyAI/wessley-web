import { ChatbotUIContext } from "@/context/context"
import {
  PROFILE_BIO_MAX,
  PROFILE_CONTEXT_MAX,
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_USERNAME_MAX,
  PROFILE_USERNAME_MIN
} from "@/db/limits"
import { updateProfile } from "@/db/profile"
import { supabase } from "@/lib/supabase/typed-client"
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconCreditCard,
  IconExternalLink,
  IconLoader2,
  IconLogout,
  IconSparkles,
  IconUser
} from "@tabler/icons-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FC, useCallback, useContext, useRef, useState, useEffect } from "react"
import { toast } from "sonner"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { LimitDisplay } from "../ui/limit-display"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { Separator } from "../ui/separator"
import { ThemeSwitcher } from "./theme-switcher"

interface ProfileSettingsProps {}

export const ProfileSettings: FC<ProfileSettingsProps> = ({}) => {
  const {
    profile,
    setProfile
  } = useContext(ChatbotUIContext)

  const router = useRouter()

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)

  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [username, setUsername] = useState(profile?.username || "")
  const [usernameAvailable, setUsernameAvailable] = useState(true)
  const [loadingUsername, setLoadingUsername] = useState(false)
  const [profileImageSrc, setProfileImageSrc] = useState(
    profile?.avatar_url || profile?.image_url || ""
  )
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [bio, setBio] = useState(profile?.bio || "")
  const [profileInstructions, setProfileInstructions] = useState(
    profile?.profile_context || ""
  )
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)

  // Update state when profile changes
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "")
      setUsername(profile.username || "")
      setProfileImageSrc(profile.avatar_url || profile.image_url || "")
      setBio(profile.bio || "")
      setProfileInstructions(profile.profile_context || "")
    }
  }, [profile])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
    return
  }

  const handleSave = async () => {
    if (!profile) return
    
    // TODO: Implement image upload functionality when needed
    // For now we'll just save the profile data without image upload
    
    const updatedProfile = await updateProfile(profile.user_id, {
      display_name: displayName,
      username,
      bio,
      profile_context: profileInstructions,
      image_url: profileImageSrc
    })

    setProfile(updatedProfile)
    toast.success("Profile updated!")
    setIsOpen(false)
  }

  const handleManageSubscription = async () => {
    if (!profile) return

    // If user has no subscription (free tier), redirect to pricing
    if (!profile.subscription_status || profile.subscription_status === 'inactive' || profile.subscription_tier === 'free') {
      router.push('/pricing')
      setIsOpen(false)
      return
    }

    setIsLoadingPortal(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          // No subscription found, redirect to pricing
          toast.info('No active subscription found. Redirecting to pricing...')
          router.push('/pricing')
          setIsOpen(false)
          return
        }
        throw new Error(data.error || 'Failed to open billing portal')
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url
    } catch (error) {
      console.error('Error opening billing portal:', error)
      toast.error('Failed to open billing portal. Please try again.')
    } finally {
      setIsLoadingPortal(false)
    }
  }

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout | null

    return (...args: any[]) => {
      const later = () => {
        if (timeout) clearTimeout(timeout)
        func(...args)
      }

      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      if (!username) return

      if (username.length < PROFILE_USERNAME_MIN) {
        setUsernameAvailable(false)
        return
      }

      if (username.length > PROFILE_USERNAME_MAX) {
        setUsernameAvailable(false)
        return
      }

      const usernameRegex = /^[a-zA-Z0-9_]+$/
      if (!usernameRegex.test(username)) {
        setUsernameAvailable(false)
        toast.error(
          "Username must be letters, numbers, or underscores only - no other characters or spacing allowed."
        )
        return
      }

      setLoadingUsername(true)

      const response = await fetch(`/api/username/available`, {
        method: "POST",
        body: JSON.stringify({ username })
      })

      const data = await response.json()
      const isAvailable = data.isAvailable

      setUsernameAvailable(isAvailable)

      if (username === profile?.username) {
        setUsernameAvailable(true)
      }

      setLoadingUsername(false)
    }, 500),
    []
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click()
    }
  }

  if (!profile) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {(profile.avatar_url || profile.image_url) ? (
          <Image
            className="mt-2 size-[48px] cursor-pointer rounded-full hover:opacity-50 object-cover"
            src={(profile.avatar_url || profile.image_url) + "?" + new Date().getTime()}
            height={48}
            width={48}
            alt={"Profile Avatar"}
          />
        ) : (
          <Button size="icon" variant="ghost">
            <IconUser size={SIDEBAR_ICON_SIZE} />
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        className="flex flex-col justify-between"
        side="left"
        onKeyDown={handleKeyDown}
      >
        <div className="grow overflow-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between space-x-2">
              <div>User Settings</div>

              <Button
                tabIndex={-1}
                className="text-xs"
                size="sm"
                onClick={handleSignOut}
              >
                <IconLogout className="mr-1" size={20} />
                Logout
              </Button>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Label>Username</Label>

                  <div className="text-xs">
                    {username !== profile.username ? (
                      usernameAvailable ? (
                        <div className="text-green-500">AVAILABLE</div>
                      ) : (
                        <div className="text-red-500">UNAVAILABLE</div>
                      )
                    ) : null}
                  </div>
                </div>

                <div className="relative">
                  <Input
                    className="pr-10"
                    placeholder="Username..."
                    value={username}
                    onChange={e => {
                      setUsername(e.target.value)
                      checkUsernameAvailability(e.target.value)
                    }}
                    minLength={PROFILE_USERNAME_MIN}
                    maxLength={PROFILE_USERNAME_MAX}
                  />

                  {username !== profile.username ? (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {loadingUsername ? (
                        <IconLoader2 className="animate-spin" />
                      ) : usernameAvailable ? (
                        <IconCircleCheckFilled className="text-green-500" />
                      ) : (
                        <IconCircleXFilled className="text-red-500" />
                      )}
                    </div>
                  ) : null}
                </div>

                <LimitDisplay
                  used={username.length}
                  limit={PROFILE_USERNAME_MAX}
                />
              </div>

              <div className="space-y-1">
                <Label>Display Name</Label>

                <Input
                  placeholder="Display name..."
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  maxLength={PROFILE_DISPLAY_NAME_MAX}
                />

                <LimitDisplay
                  used={displayName.length}
                  limit={PROFILE_DISPLAY_NAME_MAX}
                />
              </div>

              <div className="space-y-1">
                <Label>Bio</Label>

                <TextareaAutosize
                  value={bio}
                  onValueChange={setBio}
                  placeholder="Tell us about yourself... (optional)"
                  minRows={3}
                  maxRows={6}
                />

                <LimitDisplay
                  used={bio.length}
                  limit={PROFILE_BIO_MAX}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm">
                  What would you like the AI to know about you to provide better
                  responses?
                </Label>

                <TextareaAutosize
                  value={profileInstructions}
                  onValueChange={setProfileInstructions}
                  placeholder="Profile context... (optional)"
                  minRows={6}
                  maxRows={10}
                />

                <LimitDisplay
                  used={profileInstructions.length}
                  limit={PROFILE_CONTEXT_MAX}
                />
              </div>

              <Separator className="my-4" />

              {/* Subscription Management Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Subscription</Label>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      {profile.subscription_status === 'active' ? (
                        <IconCreditCard className="size-5 text-primary" />
                      ) : (
                        <IconSparkles className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {profile.subscription_tier === 'insiders' ? 'Insiders Plan' :
                         profile.subscription_tier === 'pro' ? 'Pro Plan' :
                         profile.subscription_tier === 'enterprise' ? 'Enterprise Plan' :
                         'Free Plan'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile.subscription_status === 'active' ? 'Active subscription' :
                         profile.subscription_status === 'past_due' ? 'Payment past due' :
                         'No active subscription'}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant={profile.subscription_status === 'active' ? 'outline' : 'default'}
                    size="sm"
                    onClick={handleManageSubscription}
                    disabled={isLoadingPortal}
                  >
                    {isLoadingPortal ? (
                      <IconLoader2 className="mr-1 size-4 animate-spin" />
                    ) : profile.subscription_status === 'active' ? (
                      <IconExternalLink className="mr-1 size-4" />
                    ) : (
                      <IconSparkles className="mr-1 size-4" />
                    )}
                    {profile.subscription_status === 'active' ? 'Manage' : 'Upgrade'}
                  </Button>
                </div>

                {profile.subscription_status === 'past_due' && (
                  <p className="text-xs text-amber-500">
                    Your payment is past due. Please update your payment method to continue using premium features.
                  </p>
                )}
              </div>
          </div>
        </div>

        <div className="mt-6 flex items-center">
          <div className="flex items-center space-x-1">
            <ThemeSwitcher />
          </div>

          <div className="ml-auto space-x-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            <Button ref={buttonRef} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
