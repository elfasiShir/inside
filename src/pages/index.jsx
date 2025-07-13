import Layout from "./Layout.jsx";

import Results from "./Results";

import Create from "./Create";

import PickShapeColor from "./PickShapeColor";

import Gallery from "./Gallery";

import CollectiveShape from "./CollectiveShape";

import Canvas from "./Canvas";

import About from "./About";

import ResearchProcess from "./ResearchProcess";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Results: Results,
    
    Create: Create,
    
    PickShapeColor: PickShapeColor,
    
    Gallery: Gallery,
    
    CollectiveShape: CollectiveShape,
    
    Canvas: Canvas,
    
    About: About,
    
    ResearchProcess: ResearchProcess,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Results />} />
                
                
                <Route path="/Results" element={<Results />} />
                
                <Route path="/Create" element={<Create />} />
                
                <Route path="/PickShapeColor" element={<PickShapeColor />} />
                
                <Route path="/Gallery" element={<Gallery />} />
                
                <Route path="/CollectiveShape" element={<CollectiveShape />} />
                
                <Route path="/Canvas" element={<Canvas />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/ResearchProcess" element={<ResearchProcess />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}