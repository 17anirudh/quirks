export default function Loader() {
    return (
        <div className="h-screen w-screen flex flex-col justify-center items-center bg-black">
           <div className="w-10/12">
                <img src="./duck.gif" />
           </div>
            <h2 className="animate-pulse">Loading.....</h2>
        </div>
    )
}