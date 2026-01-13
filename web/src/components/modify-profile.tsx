import { Button } from '@/lib/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/lib/components/ui/dialog';
import { Input } from "@/lib/components/ui/input"
import { Scroller } from '@/lib/components/ui/scroller';

export default function LoginModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className='cursor-pointer'>Log in</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            <img
              src="./duck.gif"
              alt="logo"
              className="h-8 w-8 rounded-full"
            />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">Modify Profile</DialogTitle>
          </DialogHeader>
        </div>
        {/* Main form */}
        <Scroller hideScrollbar className='flex flex-col justify-center items-center gap-9'>
          <h2>Avatar (PFP)</h2>
          <form>
            <Input type='image' value='avatar' />
            <Button type='submit'>Submit</Button>
          </form>
        </Scroller>
      </DialogContent>
    </Dialog>
  );
}
