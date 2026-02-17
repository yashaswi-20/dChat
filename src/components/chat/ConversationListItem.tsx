import { ChatConversation } from "@/types/chat";
import { useConversationDisplay } from "@/hooks/useConversationDisplay";

interface ConversationListItemProps {
    conversation: ChatConversation;
    isSelected: boolean;
    onSelect: (conversation: ChatConversation) => void;
}

export const ConversationListItem = ({ conversation, isSelected, onSelect }: ConversationListItemProps) => {
    const { title, description, isLoading } = useConversationDisplay(conversation);

    return (
        <button
            onClick={() => onSelect(conversation)}
            className={`w-full p-3 flex items-center gap-3 rounded-lg transition-all duration-200 text-left group
                ${isSelected
                    ? "bg-zinc-900 shadow-md border border-zinc-800"
                    : "hover:bg-zinc-900/50 hover:border-zinc-800/50 border border-transparent"
                }`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                ${isSelected
                    ? "bg-white text-black"
                    : "bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-300 transition-colors"
                }`}>
                {isLoading ? "?" : title.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`font-medium truncate transition-colors text-sm ${isSelected ? "text-white" : "text-zinc-400 group-hover:text-white"}`}>
                        {title.toUpperCase()}
                    </span>
                </div>
                <p className={`text-xs truncate transition-colors ${isSelected ? "text-zinc-400" : "text-zinc-600 group-hover:text-zinc-500"}`}>
                    {description || "No messages yet"}
                </p>
            </div>
        </button>
    );
};
