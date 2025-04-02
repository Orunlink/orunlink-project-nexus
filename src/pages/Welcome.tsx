
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OrunlinkLogo from "@/components/ui/OrunlinkLogo";

const Welcome = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left side - Welcome content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24 animate-fade-in">
          <div className="flex items-center mb-4">
            <OrunlinkLogo size={60} showText={false} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 ml-4">
              Welcome to <span className="text-orunlink-purple">Orunlink</span>
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-8 max-w-lg">
            Connect with like-minded individuals, showcase your projects, and collaborate on exciting ventures.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild className="bg-orunlink-purple hover:bg-orunlink-dark text-lg py-6">
              <Link to="/signup">Create Account</Link>
            </Button>
            <Button asChild variant="outline" className="text-lg py-6">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
          
          <div className="mt-12">
            <p className="text-sm text-gray-500 mb-2">
              Join thousands of creators and innovators
            </p>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"
                  style={{
                    backgroundColor: `hsl(${260 + i * 10}, 70%, ${60 + i * 5}%)`,
                  }}
                ></div>
              ))}
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                +1k
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Image */}
        <div className="w-full md:w-1/2 bg-gradient-to-tr from-orunlink-purple to-orunlink-light clip-path-slant flex items-center justify-center p-8">
          <div className="relative max-w-md animate-slide-up">
            <div className="absolute -top-6 -left-6 w-48 h-48 bg-white/10 rounded-xl transform rotate-12"></div>
            <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-white/10 rounded-xl transform -rotate-12"></div>
            
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-orunlink-purple flex items-center justify-center text-white font-bold">O</div>
                  <div className="ml-3">
                    <div className="font-semibold">Project Showcase</div>
                    <div className="text-sm text-gray-500">Collaboration made simple</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="w-1/3 h-20 bg-gray-100 rounded-lg"></div>
                    <div className="w-1/3 h-20 bg-gray-100 rounded-lg"></div>
                    <div className="w-1/3 h-20 bg-gray-100 rounded-lg"></div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-orunlink-purple/10 text-orunlink-purple">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                      </svg>
                    </div>
                    <div className="p-2 rounded-full bg-orunlink-purple/10 text-orunlink-purple">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                      </svg>
                    </div>
                    <div className="p-2 rounded-full bg-orunlink-purple/10 text-orunlink-purple">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
