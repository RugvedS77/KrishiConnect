import React from 'react';
import { 
    Eye, 
    ShoppingCart, 
    Handshake, 
    Tractor, 
    Award, 
    Truck, 
    Wrench,
    ArrowRight
} from 'lucide-react';

const TemplateSelection = ({ templates, onSelect, onView }) => {
    
    // Icon mapping for each template for a better visual representation
    const iconMap = {
        "spot-buy": <ShoppingCart className="h-8 w-8 text-green-600" />,
        "forward-agreement": <Handshake className="h-8 w-8 text-green-600" />,
        "input-financing": <Tractor className="h-8 w-8 text-green-600" />,
        "quality-tiered": <Award className="h-8 w-8 text-green-600" />,
        "staggered-delivery": <Truck className="h-8 w-8 text-green-600" />,
        "custom-project": <Wrench className="h-8 w-8 text-green-600" />,
    };

    return (
        <div className="bg-gray-50/50 p-4 sm:p-6 rounded-lg">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Select a Contract Template
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600">
                        Choose the template that best fits your agreement needs. You can customize the details in the next step.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col group hover:-translate-y-1"
                        >
                            <div className="p-6 flex-grow">
                                <div className="flex items-start justify-between">
                                    <div className="bg-green-100/70 p-3 rounded-lg">
                                        {iconMap[template.id] || <ShoppingCart className="h-8 w-8 text-green-600" />}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-xl text-gray-900 mt-5">
                                    {template.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-2 h-16">{template.description}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 mb-2">
                                        BEST FOR
                                    </p>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {template.bestFor}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-b-xl grid grid-cols-2 gap-3 mt-auto">
                                <button
                                    onClick={() => onView(template.id)}
                                    className="w-full bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-lg hover:bg-gray-300 text-sm flex items-center justify-center space-x-2 transition-colors"
                                >
                                    <Eye size={16} />
                                    <span>View</span>
                                </button>
                                <button
                                    onClick={() => onSelect(template.id)}
                                    className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-700 text-sm flex items-center justify-center space-x-2 transition-colors"
                                >
                                    <span>Use Template</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplateSelection;

